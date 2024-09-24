import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/app/utils/cloudflareR2/r2';
import { NextResponse } from 'next/server';

/**
 * Retrieve file with specific id from the R2 Cloudflare storage bucket
 * @param request Incoming request
 * @returns Response with the bytes of the file requested
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file_name') || '';

    const file = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
      })
    );

    if (!file) {
      console.error('File not found');
      throw new Error('File not found.');
    }

    return new Response(file.Body?.transformToWebStream(), {
      headers: {
        'Content-Type': `image/${fileName.split('.').pop()}`,
        'Cache-Control': 'public, max-age=31536000, immutable', // Optional caching headers
      },
    });
  } catch (err) {
    console.error('Error fetching file');
    return NextResponse.json({ error: 'Error fetching file' }, {
      status: 400,
    });
  }
}
