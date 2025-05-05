"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const testimonialsRef = collection(db, "testimonials");
        const querySnapshot = await getDocs(testimonialsRef);

        const testimonialsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "",
          role: doc.data().role || "",
          image: doc.data().image || "",
          quote: doc.data().quote || "",
        })) as Testimonial[];
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };
    fetchTestimonials();
  }, []);
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <Card className="h-full bg-background">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-6 text-accent">
          <Quote className="h-10 w-10" />
        </div>

        <p className="flex-grow mb-6 italic text-muted-foreground">
          "{testimonial.quote}"
        </p>

        <div className="flex items-center">
          <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h4 className="font-semibold">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
