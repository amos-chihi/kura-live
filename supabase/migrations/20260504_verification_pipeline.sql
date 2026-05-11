create or replace function public.kura_compute_alert_severity(delta_value integer)
returns text
language sql
immutable
as $$
  select case
    when delta_value >= 5 then 'critical'
    when delta_value between 1 and 4 then 'warning'
    else 'info'
  end
$$;

create or replace function public.kura_refresh_station_alerts(target_station_code text)
returns void
language plpgsql
as $$
begin
  delete from public.alerts where station_code = target_station_code;

  insert into public.alerts (
    station_code,
    agent_id,
    candidate_name,
    delta,
    audio_votes,
    form34a_votes,
    iebc_votes,
    severity,
    alert_status
  )
  with comparison as (
    select
      station_code,
      max(agent_id) as agent_id,
      candidate_name,
      max(audio_votes) as audio_votes,
      max(form34a_votes) as form34a_votes,
      max(iebc_votes) as iebc_votes
    from public.tally_entries
    where station_code = target_station_code
    group by station_code, candidate_name
  )
  select
    station_code,
    agent_id,
    candidate_name,
    greatest(
      abs(coalesce(audio_votes, 0) - coalesce(form34a_votes, 0)),
      abs(coalesce(audio_votes, 0) - coalesce(iebc_votes, 0)),
      abs(coalesce(form34a_votes, 0) - coalesce(iebc_votes, 0))
    ) as delta,
    audio_votes,
    form34a_votes,
    iebc_votes,
    public.kura_compute_alert_severity(
      greatest(
        abs(coalesce(audio_votes, 0) - coalesce(form34a_votes, 0)),
        abs(coalesce(audio_votes, 0) - coalesce(iebc_votes, 0)),
        abs(coalesce(form34a_votes, 0) - coalesce(iebc_votes, 0))
      )
    ) as severity,
    'open' as alert_status
  from comparison
  where (
    (audio_votes is not null and form34a_votes is not null and abs(audio_votes - form34a_votes) >= 1) or
    (audio_votes is not null and iebc_votes is not null and abs(audio_votes - iebc_votes) >= 1) or
    (form34a_votes is not null and iebc_votes is not null and abs(form34a_votes - iebc_votes) >= 1)
  );
end;
$$;

create or replace function public.kura_sync_alerts_trigger()
returns trigger
language plpgsql
as $$
begin
  perform public.kura_refresh_station_alerts(coalesce(new.station_code, old.station_code));
  return coalesce(new, old);
end;
$$;

drop trigger if exists kura_sync_alerts_on_tallies on public.tally_entries;

create trigger kura_sync_alerts_on_tallies
after insert or update or delete on public.tally_entries
for each row
execute function public.kura_sync_alerts_trigger();
