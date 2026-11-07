import TransferFormPageClient from './PageClient';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return ['new', '1', '2', '3', '4'].map(id => ({ id }));
}

export default function TransferFormPage({ params }: Props) {
  return <TransferFormPageClient params={params} />;
}
