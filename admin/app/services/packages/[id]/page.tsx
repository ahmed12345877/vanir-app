import PackageFormPageClient from './PageClient';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return ['new', '1', '2', '3'].map(id => ({ id }));
}

export default function PackageFormPage({ params }: Props) {
  return <PackageFormPageClient params={params} />;
}
