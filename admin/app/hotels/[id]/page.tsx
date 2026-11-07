import HotelFormPageClient from './PageClient';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return [
    'new',
    '1',
    '2',
    '3',
    '4',
    'hotel-cairo-ritz',
    'hotel-cairo-mena',
    'hotel-dubai-burj',
    'hotel-paris-crillon',
  ].map(id => ({ id }));
}

export default function HotelFormPage({ params }: Props) {
  return <HotelFormPageClient params={params} />;
}
