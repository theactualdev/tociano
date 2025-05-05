import Link from "next/link";
import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import { AspectRatio } from "@/src/components/ui/aspect-ratio";
import { FeaturedProducts } from "@/src/components/home/FeaturedProducts";
import { Categories } from "@/src/components/home/Categories";
import { Testimonials } from "@/src/components/home/Testimonials";
import { Newsletter } from "@/src/components/home/Newsletter";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/home-banner.jpg"
            alt="Tociano Boutique Fashion"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="container relative z-10 text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight animate-fade-in">
            Elevate Your Style <br /> with African Elegance
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-slide-up">
            Discover luxurious fashion that blends traditional Nigerian
            craftsmanship with contemporary design.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/products">Shop New Arrivals</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/20"
            >
              <Link href="/products">Explore Collections</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {/* <Categories /> */}

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Brand Story */}
      <section className="py-16 bg-muted">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 animate-fade-in">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-6">
                Founded in 2022, Tociano Boutique was born from a passion for
                blending Nigerian cultural heritage with contemporary fashion.
                Each piece in our collection tells a story of tradition,
                craftsmanship, and modern elegance.
              </p>
              <p className="text-muted-foreground mb-6">
                We work with local artisans and sustainable materials to create
                fashion that not only looks good but does good. Our commitment
                to ethical practices means you can wear our pieces with pride.
              </p>
              <Button asChild variant="outline">
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <AspectRatio ratio={3 / 4} className="overflow-hidden rounded-lg">
                <Image
                  src="/story.jpg"
                  alt="Tociano Boutique Story"
                  fill
                  className="object-cover"
                />
              </AspectRatio>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Call to Action */}
      <section className="relative py-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/5935738/pexels-photo-5935738.jpeg"
            alt="Tociano Collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container relative z-10 text-white text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Handcrafted with Love
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Each piece is meticulously crafted by skilled artisans using
            traditional techniques passed down through generations.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/products">Shop Our Collection</Link>
          </Button>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
