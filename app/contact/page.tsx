import type { Metadata } from 'next'
import { ContactClient } from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Sanskar for freelance web engineering, full-stack software development, creative coding, and video editing inquiries.',
  openGraph: {
    title: 'Contact | Sanskar — Inquiries & Collaboration',
    description:
      'Available for freelance web engineering, full-stack software, creative coding, and video editing.',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
