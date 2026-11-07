import YachtFormPageClient from './PageClient';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return ['new', '1', '2', '3', '4'].map(id => ({ id }));
}

export default function YachtFormPage({ params }: Props) {
  return <YachtFormPageClient params={params} />;
}
