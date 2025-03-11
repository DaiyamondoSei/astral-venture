
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

interface CategoryPageProps {}

const CategoryPage: React.FC<CategoryPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!id) {
        setError('Category ID is missing');
        setLoading(false);
        return;
      }

      try {
        // Fetch category data from Supabase
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setCategoryData(data);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Loading Category</h2>
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !categoryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Error</h2>
          <p className="text-red-500">{error || 'Failed to load category'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{categoryData.name}</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Category Details</h2>
        <p className="mb-4">{categoryData.description}</p>
        
        {/* Add more category-specific content here */}
      </div>
    </div>
  );
};

export default CategoryPage;
