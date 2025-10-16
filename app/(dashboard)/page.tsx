import { Button } from '@/components/ui/button';
import { ArrowRight, Music, Play, Heart } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl md:text-6xl">
                Premium Beats
                <span className="block text-green-500">by StachO</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Discover and purchase high-quality beats for your next project.
                From hip hop to trap, find the perfect sound to bring your music to life.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full border-gray-600 text-white hover:bg-gray-800"
                  >
                    Browse Beats
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="w-full h-96 bg-gradient-to-br from-green-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Music className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-300">Preview beats and find your sound</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-950 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                <Music className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-white">
                  Premium Quality
                </h2>
                <p className="mt-2 text-base text-gray-300">
                  Professional-grade beats crafted with attention to detail and
                  industry-standard production quality.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-600 text-white">
                <Play className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-white">
                  Instant Preview
                </h2>
                <p className="mt-2 text-base text-gray-300">
                  Listen to full previews before purchasing. Find the perfect
                  beat for your project with our easy-to-use interface.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                <Heart className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-white">
                  Easy Licensing
                </h2>
                <p className="mt-2 text-base text-gray-300">
                  Simple, transparent licensing terms. Use your beats for
                  commercial projects with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to find your sound?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-300">
                Browse our collection of premium beats and find the perfect track
                for your next project. From hip hop to trap, we've got you covered.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg rounded-full"
                >
                  Start Browsing
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
