import { HeroSection } from '@/components/home/HeroSection';
import { DiscountedProductsBlock } from '@/components/common/DiscountedProductsBlock';
import { PopularProductsSlider } from '@/components/home/PopularProductsSlider';
import { CTASection } from '@/components/home/CTASection';
import { ProjectsSectionWrapper } from '@/components/common/ProjectsSectionWrapper';
import { BlogSection } from '@/components/common/BlogSection';

export default function HomePage(): React.ReactElement {
  return (
    <div>
      <HeroSection />

      {/* Discounted Products */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-4 pb-8">
        <DiscountedProductsBlock />
      </div>

      {/* Popular Products */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-8">
        <PopularProductsSlider />
      </div>

      {/* CTA */}
      <CTASection />

      {/* Projects */}
      <ProjectsSectionWrapper />

      {/* Blog */}
      <BlogSection />
    </div>
  );
}
