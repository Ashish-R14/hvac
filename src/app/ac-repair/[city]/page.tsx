import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITY_PAGES } from "../../../data/cityPagesData";
import CityPageContent from "../../../components/CityPageContent";
import { buildMetadata } from "../../../lib/pageMetadata";

function findCity(city: string) {
  return CITY_PAGES.find(p => p.path === `/ac-repair/${city}/`);
}

export function generateStaticParams() {
  return CITY_PAGES
    .filter(p => p.path.startsWith("/ac-repair/"))
    .map(p => ({ city: p.path.split("/")[2] }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city } = await params;
  const data = findCity(city);
  if (!data) return {};
  return buildMetadata({ title: data.title, description: data.description, path: data.path });
}

export default async function AcRepairCityPage(
  { params }: { params: Promise<{ city: string }> }
) {
  const { city } = await params;
  const data = findCity(city);
  if (!data) notFound();
  return <CityPageContent data={data} />;
}
