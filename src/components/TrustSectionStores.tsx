import { ShoppingBag, Truck, Tag, Star } from "lucide-react";

const storeFeatures = [
  {
    icon: ShoppingBag,
    title: "Verified Stores",
    description: "We vet stores for trustworthiness and product authenticity",
  },
  {
    icon: Tag,
    title: "Quality Brands",
    description: "Find a wide selection of premium and specialist pet food brands",
  },
  {
    icon: Truck,
    title: "Pickup & Delivery",
    description: "Options for same-day pickup or convenient delivery to your door",
  },
  {
    icon: Star,
    title: "Real Reviews",
    description: "Read verified customer reviews to choose the right store",
  },
];

const TrustSectionStores = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Why pet owners shop here</h2>
          <p className="mt-3 text-muted-foreground">Find trusted suppliers with great selection and fast delivery</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {storeFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSectionStores;
