import { NextRequest, NextResponse } from 'next/server'

import type { Alert, ApiResponse } from '@/lib/types'
import { getVerificationState, syncStationAlerts, updateVerificationState } from '@/lib/verificationDemo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stationCode = searchParams.get('station_code')
    const severity = searchParams.get('severity')
    const status = searchParams.get('alert_status')

    const state = stationCode ? await syncStationAlerts(stationCode) : await getVerificationState()
    const alerts = state.alerts.filter((alert) => {
      if (stationCode && alert.station_code !== stationCode) {
        return false
      }
      if (severity && alert.severity !== severity) {
        return false
      }
      if (status && alert.alert_status !== status) {
        return false
      }
      return true
    })

    return NextResponse.json<ApiResponse<Alert[]>>({ data: alerts, error: null })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to load alerts' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string; alert_status?: Alert['alert_status'] }
    if (!body.id || !body.alert_status) {
      return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Alert id and status are required' }, { status: 400 })
    }

    const state = await updateVerificationState((current) => ({
      ...current,
      alerts: current.alerts.map((alert) => (
        alert.id === body.id ? { ...alert, alert_status: body.alert_status as Alert['alert_status'] } : alert
      )),
    }))

    const updated = state.alerts.find((alert) => alert.id === body.id) ?? null
    return NextResponse.json<ApiResponse<Alert>>({ data: updated, error: null })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({ data: null, error: 'Failed to update alert' }, { status: 500 })
  }
}
