import JetFormPageClient from './PageClient';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return ['new', '1', '2', '3', '4'].map(id => ({ id }));
}

export default function JetFormPage({ params }: Props) {
  return <JetFormPageClient params={params} />;
}
