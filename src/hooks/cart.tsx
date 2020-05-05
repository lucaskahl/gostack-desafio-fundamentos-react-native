import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:cartProducts',
      );

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const [hasProduct] = products.filter(p => p.id === product.id);

      if (hasProduct) {
        return;
      }

      const newItem = { ...product, quantity: 1 };

      setProducts([...products, newItem]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updatedProducts = products.map(product => {
        if (product.id === id) {
          const productQuantity = { quantity: product.quantity };
          productQuantity.quantity += 1;

          const updatedProduct = {
            ...product,
            quantity: productQuantity.quantity,
          };

          return updatedProduct;
        }
        return product;
      });
      setProducts(updatedProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updatedProducts = products.map(product => {
        if (product.id === id) {
          if (product.quantity > 1) {
            const productQuantity = { quantity: product.quantity };
            productQuantity.quantity -= 1;

            const updatedProduct = {
              ...product,
              quantity: productQuantity.quantity,
            };

            return updatedProduct;
          }
          return product;
        }
        return product;
      });
      setProducts(updatedProducts);
    },
    [products],
  );

  useEffect(() => {
    const updateStorage = async (): Promise<void> => {
      await AsyncStorage.setItem(
        '@GoMarketPlace:cartProducts',
        JSON.stringify(products),
      );
    };

    updateStorage();
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
