import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { CatalogItems } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Image } from '@/components/ui/image';
import { Search, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItems[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedCategory]);

  const loadItems = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      }
      
      const result = await BaseCrudService.getAll<CatalogItems>(
        'catalogitems',
        {},
        { limit: 12, skip: loadMore ? skip : 0 }
      );

      if (loadMore) {
        setItems(prev => [...prev, ...result.items]);
      } else {
        setItems(result.items);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(result.items.map(item => item.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }

      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.itemName?.toLowerCase().includes(query) ||
          item.shortDescription?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleLoadMore = () => {
    loadItems(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="w-full bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <p className="font-paragraph text-sm uppercase tracking-wider mb-4 opacity-90">
            Browse Collection
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            Complete Catalog
          </h1>
          <p className="font-paragraph text-lg md:text-xl max-w-3xl leading-relaxed opacity-95">
            Explore our comprehensive collection of items. Use the filters below to find exactly what you're looking for.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="w-full bg-secondary py-8">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground opacity-50" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background text-foreground font-paragraph text-base border-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 font-paragraph text-base transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 font-paragraph text-base transition-all ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6">
            <p className="font-paragraph text-base text-secondary-foreground opacity-70">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="w-full py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          {filteredItems.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {filteredItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`/catalog/${item._id}`}
                    className="group bg-secondary overflow-hidden transition-transform duration-300 hover:-translate-y-2"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.mainImage || 'https://static.wixstatic.com/media/48031e_e09c0e58fc944c2b90fd33651eb0fb85~mv2.png?originWidth=576&originHeight=448'}
                        alt={item.itemName || 'Catalog item'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        width={600}
                      />
                    </div>
                    <div className="p-6">
                      {item.category && (
                        <p className="font-paragraph text-xs uppercase tracking-wider text-secondary-foreground opacity-60 mb-3">
                          {item.category}
                        </p>
                      )}
                      <h3 className="font-heading text-2xl text-secondary-foreground mb-3 group-hover:text-primary transition-colors">
                        {item.itemName}
                      </h3>
                      <p className="font-paragraph text-base text-secondary-foreground opacity-80 leading-relaxed mb-4">
                        {item.shortDescription}
                      </p>
                      <span className="inline-flex items-center gap-2 font-paragraph text-base text-primary group-hover:gap-4 transition-all">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button */}
              {hasNext && selectedCategory === 'all' && !searchQuery && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-paragraph text-base hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <LoadingSpinner />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Items
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="font-paragraph text-xl text-foreground opacity-70 mb-4">
                No items found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center gap-2 font-paragraph text-lg text-primary hover:gap-4 transition-all"
              >
                Clear Filters
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
