import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rebecca Torres",
    role: "Web Agency Owner",
    initials: "RT",
    quote:
      "We were using an overlay widget and still got a demand letter. AccessiScan found 47 real issues the overlay was hiding. The AI fix suggestions saved our dev team days of research.",
  },
  {
    name: "David Nakamura",
    role: "E-commerce Director",
    initials: "DN",
    quote:
      "After the FTC fined accessiBe, we needed a real solution fast. AccessiScan gave us a full WCAG audit with fix code in minutes. Our legal team uses the PDF reports as compliance evidence.",
  },
  {
    name: "Jennifer Walsh",
    role: "Freelance Developer",
    initials: "JW",
    quote:
      "I offer accessibility audits as a service now. At $39/mo I can scan client sites, generate PDF reports, and deliver fix suggestions — all branded with my agency logo. It pays for itself with one client.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Trusted by developers and agencies
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Real compliance results from real users who switched from overlays
            and enterprise tools.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
