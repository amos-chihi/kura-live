import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { FormUpload, ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      station_code, 
      agent_id, 
      form_type = '34A',
      file_path,
      sha256_hash,
      extracted_data = null
    } = body

    if (!station_code || !agent_id) {
      return NextResponse.json<ApiResponse<FormUpload>>({
        data: null,
        error: 'Station code and agent ID are required'
      }, { status: 400 })
    }

    const formData = {
      station_code,
      agent_id,
      form_type,
      file_path: file_path || null,
      sha256_hash: sha256_hash || null,
      scan_status: 'pending' as const,
      extracted_data
    }

    const { data, error } = await supabase
      .from('form_uploads')
      .insert(formData)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse<FormUpload>>({
        data: null,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<FormUpload>>({
      data,
      error: null
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<FormUpload>>({
      data: null,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
