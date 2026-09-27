import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <>
      <Header />
      <Container className="flex min-h-[70vh] flex-col items-start justify-center pt-32">
        <p className="label mb-4 text-volt">Error 404</p>
        <h1 className="display text-[clamp(3rem,10vw,8rem)]">Wrong turn.</h1>
        <p className="mt-4 text-mute">That page isn&apos;t in the garage.</p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href="/">Home</ButtonLink>
          <ButtonLink href="/shop" variant="ghost">Shop</ButtonLink>
        </div>
      </Container>
      <Footer />
    </>
  );
}
