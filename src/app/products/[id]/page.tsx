import { createClient } from '@/lib/supabaseClient';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

const supabase = createClient();
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.megurid.com';
const INCENSE_HOLDER_ID = '01cfccda-596a-4b45-9548-30f114b0f08c';
const ASHTRAY_ID = '89b6acc2-858b-4eab-b337-d9852ff2cc9a';
const INCENSE_HOLDER_DESCRIPTION = `静けさを、一本の線にする。
煙の軌跡が、空間の“中心”を立ち上げるお香立て。

コンクリートの静かな質量の上に、細いお香を一本だけ立てる。
それだけで、部屋の空気は不思議と整い始めます。

このお香立ては、「受け皿（トレイ）」と「支点」を最小限の構成でまとめた器（うつわ）です。
円形のトレイは灰をやさしく受け止め、中心の立ち上がりは、煙の方向性を美しく固定する。
存在感はありながら、輪郭はあくまで静かで、空間を圧迫しません。

夜、灯りを落として一息つくとき。
読書や作業の合間に、気持ちを切り替えたいとき。
このお香立てが、あなたの部屋に小さな“静かな中心”をつくります。

ーーーーー
特徴
・ミニマルな構成：トレイ＋支点の二要素だけで成立する、削ぎ落とした形。
・灰を受ける余白：灰が落ちる範囲を想定した円形トレイで、周囲を汚しにくい設計。
・煙が映えるプロポーション：煙が立ち上がる一本の線を、空間にきれいに通すバランス。
・素材の表情：気泡や色味のわずかな揺らぎを、工業製品にはない“質感”として残しています。

ーーーーー
カラー / サイズ
カラー：グレー
サイズ：約 直径 12 cm × 高さ 約 8 cm
※実際の寸法に合わせてご記入ください

ーーーーー
素材
モルタル、その他

ーーーーー
お手入れ / 取り扱いのご注意
・表面の埃は、乾いた柔らかい布でやさしく拭き取ってください。
・灰は完全に冷めてから捨ててください。
・素材の特性上、強い衝撃を与えると破損の原因となりますのでご注意ください。
・裏面には家具を傷つけないよう、保護材を貼り付けています。
・お香の種類・湿度などにより、灰の落ち方や煙の出方には差があります。

ーーーーー
ご購入前の注意事項
meguridのプロダクトは、一つひとつ手仕事で制作しています。
そのため、同じ製品でも色味や気泡の入り方、寸法にわずかな個体差が生じることがございます。
これは、工業製品にはない、素材そのものの表情やハンドメイドならではの魅力としてお楽しみいただければ幸いです。あらかじめご了承の上、お買い求めください。`;
const ASHTRAY_DESCRIPTION = `静けさを崩さない、灰皿。
吸い殻と灰を、ひとつの中心に静かに収める器（うつわ）。

コンクリートの重さと、円形の輪郭。
それだけで空間の空気が整い、置かれているものが「道具」ではなく「景色」になります。

この灰皿は、灰を受け止める円盤と、吸い殻の居場所をつくる切り欠きを最小限に配置した、ミニマルな設計。
使い終わったものを乱雑に置いても、中心へ戻る構造がある。
だから散らからず、圧迫感も生まれません。

一服したあとの余韻。
作業の区切り。
窓際の光や、夜の影の中で。
この灰皿が、あなたの時間に静かな秩序を残します。

過剰に飾り立てるのではなく、ただ静かにそこに在ることで、
空間に心地よい静けさと輪郭をもたらす一枚です。

ーーーーー
仕様のポイント
・切り欠き（複数）：吸い殻を“置く位置”が自然に決まり、所作が整う。
・フラットな受け皿：灰が中心に留まりやすく、掃除がしやすい。
・コンクリートの質量：軽いものが増えた日常に、静かな重さを置く。

ーーーーー
カラー / サイズ
カラー：グレー
サイズ：約 直径 12 cm × 厚さ 約1 cm

素材
モルタル、その他

ーーーーー
お手入れ / 取り扱いのご注意
表面の埃は、乾いた柔らかい布で優しく拭き取ってください。
灰や汚れは、軽く払ってから柔らかい布で拭き取ってください。
素材の特性上、強い衝撃を与えると破損の原因となりますのでご注意ください。
裏面には家具を傷つけないよう、保護材を貼り付けています。

ーーーーー
ご購入前の注意事項
meguridのプロダクトは、一つひとつ手仕事で制作しています。
そのため、同じ製品でも色味や気泡の入り方、サイズにわずかな個体差が生じることがございます。
これは、工業製品にはない、素材そのものの表情やハンドメイドならではの魅力としてお楽しみいただければ幸いです。あらかじめご了承の上、お買い求めください。`;

const resolveDescription = (productId: string, description?: string | null) => {
  if (productId === INCENSE_HOLDER_ID) {
    return INCENSE_HOLDER_DESCRIPTION;
  }
  if (productId === ASHTRAY_ID) {
    return ASHTRAY_DESCRIPTION;
  }
  return description || '';
};

// --- UGC Reviews Component ---
const ProductReviews = () => {
  return (
    <div className="bg-background py-16 text-center border-t border-accent">
      <Link 
        href="/gallery" 
        className="text-sm font-serif text-primary hover:text-foreground tracking-widest uppercase border-b border-primary hover:border-foreground pb-1 transition-colors"
      >
        View Reviews & Gallery
      </Link>
    </div>
  );
};


// Generate static paths for all products at build time
export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('id');
  return products?.map(({ id }) => ({ id })) || [];
}

// Generate metadata for the page (title, description)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', params.id)
    .single();

  const description = resolveDescription(params.id, product?.description);

  return {
    title: product?.name || 'Product',
    description,
  };
}

// The main page component, now a Server Component
const ProductPage = async ({ params }: { params: { id: string } }) => {
  // Fetch product and approved reviews in parallel
  const [productRes, reviewsRes] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('ugc_submissions').select(`*, images:ugc_images(*)`).eq('product_id', params.id).eq('status', 'approved').order('created_at', { ascending: false })
  ]);

  const { data: product, error: productError } = productRes;
  const { data: reviews, error: reviewsError } = reviewsRes;

  if (productError || !product) {
    notFound(); // Show 404 page if product not found
  }

  if (reviewsError) {
    console.error("Error fetching reviews:", reviewsError);
    // Don't block the page from rendering, just show an error in the console
  }

  const description = resolveDescription(product.id, product.description);
  const normalizedProduct = { ...product, description };

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.length > 0 
      ? product.images.map((img: string) => `${siteUrl}${img}`) 
      : (product.image ? [`${siteUrl}${product.image}`] : []),
    description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'megurid',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.id}`,
      price: product.price,
      priceCurrency: 'JPY',
      availability: product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    review: reviews?.map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5', // Assuming a 5-star rating for now
      },
      author: {
        '@type': 'Person',
        name: review.nickname || '匿名ユーザー',
      },
      reviewBody: review.caption,
      datePublished: new Date(review.created_at).toISOString(),
    })) || [],
  };

  return (
    <>
      {/* Preload other images in the carousel for faster navigation */}
      {product.images && product.images.length > 1 && (
        product.images.slice(1).map((img: string) => (
          <link key={img} rel="preload" as="image" href={img} />
        ))
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails product={normalizedProduct} />
      <ProductReviews />
    </>
  );
};

export default ProductPage;
