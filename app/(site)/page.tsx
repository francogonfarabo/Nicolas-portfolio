import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import Header from "@/components/Header";
import ProfileBoard from "@/components/board/ProfileBoard";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import ConsoleHello from "@/components/ConsoleHello";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const title = `${profile.name} · ${profile.role}`;
  return { title, description: profile.intro, openGraph: { title, description: profile.intro, type: "profile" } };
}

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <a
        href="#work"
        className="sr-only z-[80] bg-ink px-3 py-2 font-mono text-xs text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to work history
      </a>
      <Header profile={content.profile} />
      <main>
        <ProfileBoard profile={content.profile} work={content.work} skills={content.skills} />
        <Gallery gallery={content.gallery} />
      </main>
      <Footer profile={content.profile} />
      <ConsoleHello name={content.profile.shortName} />
    </>
  );
}
