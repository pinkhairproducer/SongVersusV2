import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating membership products...');

  const proProduct = await stripe.products.create({
    name: 'Pro Membership',
    description: 'For serious competitors climbing the ranks',
    metadata: {
      tier: 'pro',
      monthlyBonusCoins: '500',
    },
  });

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'pro' },
  });

  console.log(`Created Pro: ${proProduct.id} with price ${proPrice.id}`);

  const eliteProduct = await stripe.products.create({
    name: 'Elite Membership',
    description: 'For the ultimate SongVersus champions',
    metadata: {
      tier: 'elite',
      monthlyBonusCoins: '1500',
    },
  });

  const elitePrice = await stripe.prices.create({
    product: eliteProduct.id,
    unit_amount: 1999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'elite' },
  });

  console.log(`Created Elite: ${eliteProduct.id} with price ${elitePrice.id}`);

  console.log('Creating coin packages...');

  const coinPackages = [
    { name: '500 Versus Coins', amount: 499, coins: 500, bonus: null },
    { name: '1200 Versus Coins', amount: 999, coins: 1200, bonus: '20% Bonus' },
    { name: '2500 Versus Coins', amount: 1999, coins: 2500, bonus: '25% Bonus' },
    { name: '6500 Versus Coins', amount: 4999, coins: 6500, bonus: '30% Bonus' },
  ];

  for (const pkg of coinPackages) {
    const product = await stripe.products.create({
      name: pkg.name,
      description: pkg.bonus ? `${pkg.coins} coins with ${pkg.bonus}` : `${pkg.coins} Versus Coins`,
      metadata: {
        type: 'coins',
        coinAmount: pkg.coins.toString(),
        bonus: pkg.bonus || '',
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: pkg.amount,
      currency: 'usd',
      metadata: {
        type: 'coins',
        coinAmount: pkg.coins.toString(),
      },
    });

    console.log(`Created ${pkg.name}: ${product.id} with price ${price.id}`);
  }

  console.log('All products created successfully!');
}

seedProducts().catch(console.error);
