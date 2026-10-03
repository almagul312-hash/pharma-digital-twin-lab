import { Container } from "@/components/Container";

export function Footer({ text }: { text: string }) {
  return (
    <footer className="mt-auto bg-navy text-white">
      <Container className="py-8">
        <p className="text-center text-sm leading-relaxed sm:text-base">
          {text}
        </p>
      </Container>
    </footer>
  );
}
