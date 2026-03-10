import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPassword = await argon2.hash('Admin123!');
  const userPassword = await argon2.hash('User123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seeded users:', { admin: admin.email, user: user.email });

  // ── Seed Categories ────────────────────────────────

  const categoriesData = [
    { slug: 'cameras', nameKa: 'კამერები', nameRu: 'Камеры', nameEn: 'Cameras', sortOrder: 0 },
    { slug: 'nvr-kits', nameKa: 'NVR კომპლექტები', nameRu: 'NVR комплекты', nameEn: 'NVR Kits', sortOrder: 1 },
    { slug: 'accessories', nameKa: 'აქსესუარები', nameRu: 'Аксессуары', nameEn: 'Accessories', sortOrder: 2 },
    { slug: 'storage', nameKa: 'მეხსიერება', nameRu: 'Память', nameEn: 'Storage', sortOrder: 3 },
    { slug: 'services', nameKa: 'სერვისები', nameRu: 'Услуги', nameEn: 'Services', sortOrder: 4 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nameKa: cat.nameKa, nameRu: cat.nameRu, nameEn: cat.nameEn, sortOrder: cat.sortOrder },
      create: cat,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seeded categories:', categoriesData.length);

  // ── Seed Projects ──────────────────────────────────

  const projectsData = [
    {
      slug: 'shopping-center-gallery',
      titleKa: 'სავაჭრო ცენტრი "გალერეა"',
      titleRu: 'ТЦ "Галерея"',
      titleEn: 'Shopping Center "Gallery"',
      locationKa: 'თბილისი, ვაკე',
      locationRu: 'Тбилиси, Ваке',
      locationEn: 'Tbilisi, Vake',
      type: 'commercial',
      cameras: 48,
      image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
      year: '2024',
      sortOrder: 0,
    },
    {
      slug: 'residential-complex-new-city',
      titleKa: 'საცხოვრებელი კომპლექსი "ნიუ სითი"',
      titleRu: 'ЖК "Нью Сити"',
      titleEn: 'Residential Complex "New City"',
      locationKa: 'თბილისი, საბურთალო',
      locationRu: 'Тбилиси, Сабуртало',
      locationEn: 'Tbilisi, Saburtalo',
      type: 'residential',
      cameras: 24,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
      year: '2024',
      sortOrder: 1,
    },
    {
      slug: 'office-center-city-tower',
      titleKa: 'ოფისური ცენტრი "სითი ტაუერი"',
      titleRu: 'Офисный центр "Сити Тауэр"',
      titleEn: 'Office Center "City Tower"',
      locationKa: 'თბილისი, მთაწმინდა',
      locationRu: 'Тбилиси, Мтацминда',
      locationEn: 'Tbilisi, Mtatsminda',
      type: 'office',
      cameras: 32,
      image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
      year: '2025',
      sortOrder: 2,
    },
    {
      slug: 'supermarket-chain-smart',
      titleKa: 'სუპერმარკეტების ქსელი "სმარტი"',
      titleRu: 'Сеть супермаркетов "Смарт"',
      titleEn: 'Supermarket Chain "Smart"',
      locationKa: 'მთელი საქართველო',
      locationRu: 'Вся Грузია',
      locationEn: 'Across Georgia',
      type: 'retail',
      cameras: 120,
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80',
      year: '2025',
      sortOrder: 3,
    },
  ];

  const existingCount = await prisma.project.count();
  if (existingCount === 0) {
    await prisma.project.createMany({ data: projectsData });
  }

  // eslint-disable-next-line no-console
  console.log('Seeded projects:', projectsData.length);

  // ── Seed Articles ─────────────────────────────────

  const articlesData = [
    {
      slug: 'how-to-choose-security-camera',
      title: 'როგორ ავირჩიოთ სახლისთვის სათვალთვალო კამერა 2025 წელს',
      excerpt: 'IP კამერა, WiFi კამერა თუ ანალოგური? განვიხილოთ მთავარი განსხვავებები და ვარიანტი თქვენი ბიუჯეტისა და მოთხოვნების მიხედვით.',
      coverImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&q=80',
      category: 'cameras',
      readMin: 5,
      isPublished: true,
      authorId: admin.id,
      content: `# როგორ ავირჩიოთ სახლისთვის სათვალთვალო კამერა

სათვალთვალო კამერის შერჩევა ბევრ ფაქტორზეა დამოკიდებული. ამ სტატიაში განვიხილავთ მთავარ კრიტერიუმებს.

![IP კამერა სახლის გარეთ](https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80)

## IP კამერა vs WiFi კამერა

**IP კამერები** უკეთეს ხარისხს გვთავაზობენ და უფრო საიმედოა სტაბილური კავშირისთვის. ისინი ქსელურ კაბელს იყენებენ (PoE).

**WiFi კამერები** მარტივია დასამონტაჟებელი — არ სჭირდება კაბელი. იდეალურია ბინებისთვის და მცირე ოფისებისთვის.

![WiFi კამერა ბინაში](https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80)

## რას მივაქციოთ ყურადღება?

- **რეზოლუცია** — მინიმუმ 2მპ (1080p), რეკომენდებულია 5მპ
- **ღამის ხედვა** — Smart IR ტექნოლოგია უკეთესი შედეგის იძლევა
- **Micro SD** — ლოკალური ჩაწერა ინტერნეტის გარეშე
- **წყალგაუმტარობა** — გარე მონტაჟისთვის IP67 სტანდარტი

![კამერის ღამის ხედვის რეჟიმი](https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=80)

## რეკომენდაცია

სახლისთვის რეკომენდაციაა **Tiandy 5მპ IP კამერა** — საუკეთესო ფას-ხარისხის თანაფარდობით.`,
    },
    {
      slug: 'nvr-vs-dvr-differences',
      title: 'NVR vs DVR — რა განსხვავებაა და რომელი აირჩიოთ',
      excerpt: 'ვიდეო ჩამწერი მოწყობილობების ორი ძირითადი ტიპი არსებობს — NVR და DVR. განვიხილოთ მათი განსხვავებები და უპირატესობები.',
      coverImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80',
      category: 'nvr',
      readMin: 7,
      isPublished: true,
      authorId: admin.id,
      content: `# NVR vs DVR — რა განსხვავებაა?

ვიდეო ჩამწერი მოწყობილობების ორი ძირითადი ტიპი არსებობს — **NVR** (Network Video Recorder) და **DVR** (Digital Video Recorder).

## DVR — ციფრული ვიდეო ჩამწერი

DVR მოწყობილობა **ანალოგურ კამერებთან** მუშაობს. სიგნალი კოაქსიალური კაბელით გადაეცემა და DVR-ში ხდება ციფრულ ფორმატში კონვერტაცია.

![DVR მოწყობილობა](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80)

### DVR-ის უპირატესობები:
- დაბალი ფასი
- მარტივი კონფიგურაცია
- შეთავსებადია ძველ ანალოგურ კამერებთან

## NVR — ქსელური ვიდეო ჩამწერი

NVR მოწყობილობა **IP კამერებთან** მუშაობს. ვიდეო სიგნალი ქსელის (Ethernet) საშუალებით გადაეცემა.

![NVR სისტემა ოფისში](https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80)

### NVR-ის უპირატესობები:
- მაღალი რეზოლუცია (4K და მეტი)
- PoE მხარდაჭერა — ერთი კაბელი კვებისა და მონაცემებისთვის
- მოქნილი არქიტექტურა — კამერა შეიძლება 100მ-ზე შორს იყოს
- აუდიო ჩაწერის მხარდაჭერა

## რომელი აირჩიოთ?

| კრიტერიუმი | DVR | NVR |
|------------|-----|-----|
| ხარისხი | 1080p მაქს | 4K+ |
| კაბელი | კოაქსიალური | Ethernet (PoE) |
| ფასი | დაბალი | საშუალო-მაღალი |
| მასშტაბურობა | შეზღუდული | მოქნილი |

![კამერების შედარება](https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80)

**ჩვენი რეკომენდაცია**: ახალი ინსტალაციისთვის ყოველთვის აირჩიეთ **NVR + IP კამერები**.`,
    },
    {
      slug: 'camera-installation-tips',
      title: 'კამერის მონტაჟის 7 მთავარი რჩევა',
      excerpt: 'სწორი მონტაჟი კამერის ეფექტურობის საფუძველია. გაეცანით პროფესიონალთა რჩევებს სათვალთვალო კამერის სწორად დამონტაჟებისთვის.',
      coverImage: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=1200&q=80',
      category: 'installation',
      readMin: 6,
      isPublished: true,
      authorId: admin.id,
      content: `# კამერის მონტაჟის 7 მთავარი რჩევა

სწორი მონტაჟი კამერის ეფექტურობის საფუძველია. აქ მოცემულია ჩვენი გუნდის რეკომენდაციები.

## 1. სწორი სიმაღლე

კამერა დაამონტაჟეთ **3-4 მეტრის** სიმაღლეზე. ძალიან დაბალი — ადვილად მისაწვდომია ვანდალიზმისთვის, ძალიან მაღალი — სახეების ამოცნობა გართულდება.

![კამერის მონტაჟი კედელზე](https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80)

## 2. განათების გათვალისწინება

- არ მიმართოთ კამერა პირდაპირ მზისკენ
- ღამის ხედვისთვის გამოიყენეთ IR განათების მქონე კამერა
- შესასვლელთან გამოიყენეთ WDR ტექნოლოგია

## 3. კაბელის სწორი გაყვანა

- გამოიყენეთ **CAT6** კაბელი IP კამერებისთვის
- მაქსიმალური სიგრძე — **100 მეტრი** (PoE)
- კაბელი გაავლეთ დაცულ არხებში

![ქსელის კაბელები](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80)

## 4. ამინდისგან დაცვა

გარე კამერებისთვის:
- **IP67** წყალგაუმტარობის სტანდარტი
- კონექტორები დაიცავით სილიკონით
- თავიდან აარიდეთ პირდაპირ წვიმას

![გარე კამერა წვიმაში](https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80)

## 5. ჩაწერის მოცულობის გაანგარიშება

- 1 კამერა (5მპ, H.265) ≈ **15-20 GB/დღეში**
- 8 კამერა × 30 დღე = **~4 TB** HDD
- ყოველთვის აიღეთ 20%-ით მეტი მოცულობა

## 6. ქსელის უსაფრთხოება

- შეცვალეთ ნაგულისხმევი პაროლები
- გამოიყენეთ ცალკე VLAN კამერებისთვის
- გამორთეთ UPnP

## 7. ტესტირება მონტაჟის შემდეგ

- შეამოწმეთ ყველა კამერის ხედვის არე
- გატესტეთ ღამის ხედვა
- დარწმუნდით ჩაწერის მუშაობაში

![მონტაჟის შემდეგ ტესტირება](https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80)`,
    },
    {
      slug: '4g-camera-guide',
      title: '4G კამერა — როდის გამოვიყენოთ და რატომ',
      excerpt: '4G/LTE კამერები იდეალურია მშენებლობებზე, ფერმებში და ისეთ ადგილებში, სადაც ინტერნეტი არ არის ხელმისაწვდომი.',
      coverImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80',
      category: 'cameras',
      readMin: 4,
      isPublished: true,
      authorId: admin.id,
      content: `# 4G კამერა — როდის გამოვიყენოთ?

4G/LTE კამერები მობილურ ქსელს იყენებენ ვიდეოს გადასაცემად. ისინი იდეალურია იქ, სადაც ფიზიკური ინტერნეტ კავშირი არ არის.

![4G კამერა მშენებლობაზე](https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80)

## სად გამოიყენება?

- **მშენებლობები** — დროებითი მონიტორინგი
- **ფერმები და აგარაკები** — მოშორებული ტერიტორიები
- **პარკინგები** — ღია ტერიტორიები WiFi-ს გარეშე
- **ღონისძიებები** — დროებითი სათვალთვალო სისტემა

![ფერმაზე დამონტაჟებული კამერა](https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80)

## უპირატესობები

- არ სჭირდება ინტერნეტ კაბელი ან WiFi
- მარტივი ინსტალაცია — ჩადეთ SIM ბარათი და ჩართეთ
- მობილური აპით წვდომა ნებისმიერი ადგილიდან
- მზის პანელთან კომბინაციით — სრულად ავტონომიური

![მზის პანელიანი კამერა](https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80)

## მნიშვნელოვანი ფაქტორები

1. **მობილური ქსელის დაფარვა** — შეამოწმეთ 4G სიგნალი ადგილზე
2. **მონაცემთა მოცულობა** — H.265 კოდეკი მნიშვნელოვნად ამცირებს ტრაფიკს
3. **SIM ბარათის ტარიფი** — აირჩიეთ შეუზღუდავი ან მაღალმოცულობიანი პაკეტი
4. **ელკვება** — მზის პანელი + აკუმულატორი ავტონომიური მუშაობისთვის`,
    },
    {
      slug: 'poe-technology-explained',
      title: 'PoE ტექნოლოგია — რა არის და რატომ არის მნიშვნელოვანი',
      excerpt: 'Power over Ethernet (PoE) ტექნოლოგია საშუალებას გაძლევთ ერთი კაბელით მიაწოდოთ კამერას ელკვება და მონაცემები ერთდროულად.',
      coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80',
      category: 'guides',
      readMin: 5,
      isPublished: true,
      authorId: admin.id,
      content: `# PoE ტექნოლოგია — რა არის და რატომ არის მნიშვნელოვანი

**Power over Ethernet (PoE)** ტექნოლოგია საშუალებას გაძლევთ ერთი Ethernet კაბელით მიაწოდოთ მოწყობილობას როგორც ელექტროენერგია, ასევე მონაცემები.

## როგორ მუშაობს?

PoE სვიჩი ან ინჟექტორი ელექტროენერგიას ამატებს Ethernet კაბელში. მოწყობილობა (კამერა, წვდომის წერტილი) იღებს კვებას იმავე კაბელიდან.

![PoE სვიჩი](https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80)

## PoE სტანდარტები

| სტანდარტი | სიმძლავრე | გამოყენება |
|-----------|-----------|-----------|
| PoE (802.3af) | 15.4W | IP კამერები, VoIP ტელეფონები |
| PoE+ (802.3at) | 30W | PTZ კამერები, WiFi AP |
| PoE++ (802.3bt) | 60-100W | მაღალი სიმძლავრის მოწყობილობები |

![ქსელის ინფრასტრუქტურა](https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80)

## უპირატესობები სათვალთვალო სისტემებში

1. **ერთი კაბელი** — არ გჭირდებათ ცალკე ელკვების ხაზი თითოეულ კამერასთან
2. **მარტივი ინსტალაცია** — ნაკლები კაბელი = ნაკლები დრო და ხარჯი
3. **ცენტრალიზებული მართვა** — სვიჩიდან შეგიძლიათ კამერის გადატვირთვა
4. **UPS დაცვა** — ერთი UPS სვიჩზე იცავს ყველა კამერას

![PoE კამერა ჭერზე](https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80)

## რეკომენდაცია

- **8 კამერამდე** — 8-პორტიანი PoE სვიჩი (120W ბიუჯეტი)
- **16 კამერამდე** — 16-პორტიანი PoE სვიჩი (250W ბიუჯეტი)
- ყოველთვის აირჩიეთ სვიჩი **20%-ით მეტი** PoE ბიუჯეტით, ვიდრე გჭირდებათ`,
    },
  ];

  const existingArticlesCount = await prisma.article.count();
  if (existingArticlesCount === 0) {
    for (const articleData of articlesData) {
      await prisma.article.create({ data: articleData });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seeded articles:', articlesData.length);

  // ── Seed Site Settings ─────────────────────────────

  await prisma.siteSetting.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      data: {
        stats: {
          camerasInstalled: '500+',
          projectsCompleted: '120+',
          yearsExperience: '5+',
          warrantyYears: '2',
        },
        contact: { phone: '', whatsapp: '', email: '' },
        business: {
          companyName: '',
          address: { city: '', region: '', country: '' },
          geo: { latitude: 0, longitude: 0 },
        },
        hours: {
          weekdays: { open: '09:00', close: '18:00' },
          sunday: { open: '10:00', close: '16:00' },
        },
        social: { facebook: '', instagram: '', tiktok: '' },
        announcement: { enabled: false, textKa: '', textRu: '', textEn: '' },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seeded site settings');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
