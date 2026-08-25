import type { CityPageData } from "./cityPagesData";

interface CityPageProps {
  data: CityPageData;
}

export default function CityPage({ data }: CityPageProps) {
  return (
    <>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      <link rel="canonical" href={`https://www.climewaveengineers.com${data.path}`} />
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", fontFamily: "'Syne', sans-serif", color: "#1a2a2a", lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>{data.h1}</h1>
        <p>{data.intro}</p>

        <h2 style={{ fontSize: 22, marginTop: 32, marginBottom: 12 }}>{data.servicesHeading}</h2>
        <ul>
          {data.services.map(s => <li key={s}>{s}</li>)}
        </ul>

        <h2 style={{ fontSize: 22, marginTop: 32, marginBottom: 12 }}>{data.areasHeading}</h2>
        <p>{data.areas}</p>

        <h2 style={{ fontSize: 22, marginTop: 32, marginBottom: 12 }}>{data.whyHeading}</h2>
        <p>{data.why}</p>

        <p style={{ marginTop: 40, fontSize: 14, color: "#5a6a6a" }}>
          Call +91-5946-317680 · WhatsApp +91 9911992271 · <a href="/">Back to Climewave Engineers</a>
        </p>
      </section>
    </>
  );
}
