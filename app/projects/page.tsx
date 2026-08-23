import type { Metadata } from 'next'
import { ProjectsClient } from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Featured engineering builds, 3D WebGL experiences, AI engineering curriculum, and creative digital solutions by Sanskar.',
  openGraph: {
    title: 'Projects | Sanskar — Selected Works & Engineering Builds',
    description:
      'Featured web engineering, 3D WebGL experiences, AI engineering curriculum, and full-stack software applications.',
  },
}

export default function ProjectsPage() {
  return <ProjectsClient />
}
