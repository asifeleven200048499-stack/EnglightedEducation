export function AboutView({ section }: { section: string }) {
  const content: Record<string, { title: string; body: string }> = {
    'who-we-are': {
      title: 'Who We Are',
      body: 'ENLIGHTED is a premier educational consultancy platform dedicated to helping students find their perfect college match across India.',
    },
    'what-we-do': {
      title: 'What We Do',
      body: 'We provide admission guidance, course selection, and career counseling services to ensure every student finds their ideal educational path.',
    },
    'whom-we-serve': {
      title: 'Whom We Serve',
      body: 'We serve students seeking admissions to degree, engineering, and medical colleges across Bangalore, Mangalore, Kerala and beyond.',
    },
    'where-we-serve': {
      title: 'Where We Serve',
      body: 'We currently operate across Bangalore, Mangalore, and Kerala with a network of 60+ partner colleges.',
    },
  };

  const page = content[section] || { title: 'About Us', body: '' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
        <p className="text-slate-500 mt-2">{page.body}</p>
      </div>
    </div>
  );
}
