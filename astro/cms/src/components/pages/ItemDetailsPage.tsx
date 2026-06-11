import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { CatalogItems } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Image } from '@/components/ui/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<CatalogItems | null>(null);
  const [relatedItems, setRelatedItems] = useState<CatalogItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      setIsLoading(true);
      setNotFound(false);

      const data = await BaseCrudService.getById<CatalogItems>('catalogitems', id!);
      
      if (!data) {
        setNotFound(true);
        return;
      }

      setItem(data);

      // Load related items from same category
      if (data.category) {
        const result = await BaseCrudService.getAll<CatalogItems>('catalogitems', {}, { limit: 3 });
        const related = result.items.filter(
          relatedItem => relatedItem.category === data.category && relatedItem._id !== data._id
        );
        setRelatedItems(related);
      }
    } catch (error) {
      console.error('Failed to load item:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 py-20 text-center">
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-6">
            Item Not Found
          </h1>
          <p className="font-paragraph text-lg text-foreground opacity-70 mb-8">
            The item you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-paragraph text-base hover:bg-opacity-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <section className="w-full bg-secondary py-6">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 font-paragraph text-sm text-secondary-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-primary transition-colors">
              Catalog
            </Link>
            <span>/</span>
            <span className="opacity-70">{item.itemName}</span>
          </div>
        </div>
      </section>

      {/* Item Details */}
      <section className="w-full py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
            {/* Image */}
            <div className="relative aspect-[4/3] lg:aspect-square">
              <Image
                src={item.mainImage || 'https://static.wixstatic.com/media/48031e_1668a2d467984d2daa6d42715ee5b035~mv2.png?originWidth=768&originHeight=576'}
                alt={item.itemName || 'Item image'}
                className="w-full h-full object-cover"
                width={800}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              {item.category && (
                <p className="font-paragraph text-sm uppercase tracking-wider text-foreground opacity-60 mb-4">
                  {item.category}
                </p>
              )}
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                {item.itemName}
              </h1>
              {item.shortDescription && (
                <p className="font-paragraph text-xl text-foreground opacity-80 leading-relaxed mb-8">
                  {item.shortDescription}
                </p>
              )}
              {item.fullDescription && (
                <div className="prose prose-lg max-w-none">
                  <p className="font-paragraph text-lg text-foreground opacity-80 leading-relaxed">
                    {item.fullDescription}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-8 pt-8 border-t border-secondary">
                <div className="grid grid-cols-2 gap-6">
                  {item._createdDate && (
                    <div>
                      <p className="font-paragraph text-sm uppercase tracking-wider text-foreground opacity-60 mb-2">
                        Added
                      </p>
                      <p className="font-paragraph text-base text-foreground">
                        {new Date(item._createdDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {item.isFeatured && (
                    <div>
                      <p className="font-paragraph text-sm uppercase tracking-wider text-foreground opacity-60 mb-2">
                        Status
                      </p>
                      <p className="font-paragraph text-base text-primary font-medium">
                        Featured Item
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 font-paragraph text-lg text-primary hover:gap-4 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Catalog
                </Link>
              </div>
            </div>
          </div>

          {/* Related Items */}
          {relatedItems.length > 0 && (
            <div className="border-t border-secondary pt-16">
              <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-12">
                Related Items
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {relatedItems.map((relatedItem) => (
                  <Link
                    key={relatedItem._id}
                    to={`/catalog/${relatedItem._id}`}
                    className="group bg-secondary overflow-hidden transition-transform duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        src={relatedItem.mainImage || 'https://static.wixstatic.com/media/48031e_295879a37ff24eb59d1cd24c129ab33b~mv2.png?originWidth=576&originHeight=448'}
                        alt={relatedItem.itemName || 'Related item'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        width={600}
                      />
                    </div>
                    <div className="p-6">
                      {relatedItem.category && (
                        <p className="font-paragraph text-xs uppercase tracking-wider text-secondary-foreground opacity-60 mb-3">
                          {relatedItem.category}
                        </p>
                      )}
                      <h3 className="font-heading text-2xl text-secondary-foreground mb-3 group-hover:text-primary transition-colors">
                        {relatedItem.itemName}
                      </h3>
                      <p className="font-paragraph text-base text-secondary-foreground opacity-80 leading-relaxed mb-4">
                        {relatedItem.shortDescription}
                      </p>
                      <span className="inline-flex items-center gap-2 font-paragraph text-base text-primary group-hover:gap-4 transition-all">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
