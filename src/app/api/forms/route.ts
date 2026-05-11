import { createHash } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'

import type { ApiResponse, FormUpload } from '@/lib/types'
import {
  buildComparisonRows,
  buildVerificationStats,
  persistSourceResults,
  resolveDemoFormSample,
  syncStationAlerts,
  updateVerificationState,
} from '@/lib/verificationDemo'

interface FormProcessResponse {
  upload: FormUpload
  comparison_rows: ReturnType<typeof buildComparisonRows>
  stats: ReturnType<typeof buildVerificationStats>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stationCode = searchParams.get('station_code')
    const state = await updateVerificationState((current) => current)
    const uploads = stationCode
      ? state.form_uploads.filter((upload) => upload.station_code === stationCode)
      : state.form_uploads

    return NextResponse.json<ApiResponse<FormUpload[]>>({ data: uploads, error: null })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to load form uploads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const sampleId = (formData.get('sample_id') as string | null) ?? null
    const stationCode = ((formData.get('station_code') as string | null) ?? 'KE-047-290-0001').trim()
    const agentId = ((formData.get('agent_id') as string | null) ?? 'agent-001').trim()
    const sample = resolveDemoFormSample(sampleId, file?.name ?? null)

    const fileHash = file
      ? createHash('sha256').update(Buffer.from(await file.arrayBuffer())).digest('hex')
      : createHash('sha256').update(sample.preview_path).digest('hex')

    const state = await persistSourceResults({
      station_code: stationCode,
      agent_id: agentId || null,
      source: 'form34a_votes',
      confidence: 0.96,
      results: sample.extracted_results,
    })

    const updatedState = await updateVerificationState((current) => ({
      ...current,
      form_uploads: [
        {
          id: crypto.randomUUID(),
          station_code: stationCode,
          agent_id: agentId || null,
          form_type: '34A',
          file_path: file?.name ? `/uploads/${file.name}` : sample.preview_path,
          sha256_hash: fileHash,
          scan_status: 'complete',
          extracted_data: {
            station_code: stationCode,
            station_name: sample.label,
            results: sample.extracted_results,
            total_valid_votes: sample.total_valid_votes,
            total_rejected_votes: sample.total_rejected_votes,
            presiding_officer: sample.presiding_officer,
          },
          created_at: new Date().toISOString(),
        },
        ...current.form_uploads.filter((upload) => upload.station_code !== stationCode),
      ],
    }))

    const syncedState = await syncStationAlerts(stationCode)
    const comparisonRows = buildComparisonRows(syncedState.tally_entries, stationCode)
    const upload = updatedState.form_uploads.find((entry) => entry.station_code === stationCode) ?? updatedState.form_uploads[0]

    return NextResponse.json<ApiResponse<FormProcessResponse>>({
      data: {
        upload,
        comparison_rows: comparisonRows,
        stats: buildVerificationStats(comparisonRows),
      },
      error: null,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: 'Failed to process the uploaded Form 34A sample',
    }, { status: 500 })
  }
}
