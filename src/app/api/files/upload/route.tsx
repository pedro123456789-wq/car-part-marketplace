import { NextResponse } from 'next/server'
import chalk from 'chalk'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { r2 } from '@/app/utils/cloudflareR2/r2'

/**
 * Generate a URL to upload a file into the R2 Cloudfare storage bucket
 * @param request Incoming request
 * @returns Response with the signed upload URL
 */
export async function POST(request: Request) {
	try {
        console.log(chalk.yellow('Generating upload URL for Cloudfare R2 storage'));
        const fileName = request.headers.get('file_name') || '';
		const fileType = request.headers.get('file_type') || '';

		const signedUrl = await getSignedUrl(
			r2,
			new PutObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME,
				Key: fileName, 
				ContentType: fileType
			}),
			{ expiresIn: 5 * 60 }
		)

		console.log(chalk.green('Created signed upload URL'));
		return NextResponse.json({ url: signedUrl })
	} catch (err) {
		console.log(err)
		return NextResponse.json({error: true}, {
			status: 400
		})
	}
}