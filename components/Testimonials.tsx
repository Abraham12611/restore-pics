import Image from 'next/image';

const testimonials = [
  [
    {
      content:
        "Many thanks for restoring my 50-year-old family photo. The result exceeded my expectations. Other services couldn't help, but Restore Pics worked magic on it. My family is thrilled with the result!",
      link: '#',
      author: {
        name: 'Sarah Mitchell',
        role: 'User',
        image: '/sm.jpg',
      },
    },
    {
      content:
        "I can't believe how well you restored my damaged wedding photo! Not only did you fix all the tears and creases, but you even reconstructed missing parts. The final result is better than the original. Excellent service!",
      link: '#',
      author: {
        name: 'Emma Thompson',
        role: 'User',
        image: '/EW.jpg',
      },
    },
  ],
  [
    {
      content:
        "Everyone said my photo was beyond repair, but Restore Pics was willing to try. The result was amazing! Very affordable and they even sent me multiple copies. I'll recommend them to everyone!",
      link: '#',
      author: {
        name: 'Michael Chen',
        role: 'User',
        image: '/mc.jpg',
      },
    },
    {
      content:
        "The service was professional, reasonably priced, and incredibly fast. We thought our picture was beyond saving, but it was restored almost to perfection. Wonderful to deal with!",
      link: '#',
      author: {
        name: 'Lisa Rodriguez',
        role: 'User',
        image: '/LS.jpg',
      },
    },
  ],
  [
    {
      content:
        "I was amazed at the quality of work! Got a quote within 24 hours and the restoration was complete in just a few days. The only baby picture I had of my father is now beautifully restored. Thank you!",
      link: '#',
      author: {
        name: 'David Wilson',
        role: 'User',
        image: '/dw.png',
      },
    },
    {
      content:
        "Restore Pics did an awesome job with my photo restoration. Their prices are reasonable and the service is super fast! I had proofs to examine in less than 24 hours. Would definitely recommend!",
      link: '#',
      author: {
        name: 'Jennifer Park',
        role: 'User',
        image: '/jp.webp',
      },
    },
  ],
];

export function Testimonials() {
  return (
    <section
      id='testimonials'
      aria-label='What our customers are saying'
      className='py-10'
    >
      <div className='mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto md:text-center'>
          <h1 className='mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl'>
            Loved by many worldwide.
          </h1>
          <p className='mx-auto mt-6 max-w-xl text-lg text-slate-700 leading-7'>
            See what our 5,000+ users are saying about the product.
          </p>
        </div>
        <ul
          role='list'
          className='mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-16 lg:max-w-none lg:grid-cols-3'
        >
          {testimonials.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role='list' className='flex flex-col gap-y-6 sm:gap-y-8'>
                {column.map((testimonial, testimonialIndex) => (
                  <li
                    key={testimonialIndex}
                    className='hover:scale-105 transition duration-300 ease-in-out'
                  >
                    <a href={testimonial.link} target='_blank' rel='noreferrer'>
                      <figure className='relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10'>
                        <blockquote className='relative'>
                          <p className='text-lg tracking-tight text-slate-900'>
                            "{testimonial.content}"
                          </p>
                        </blockquote>
                        <figcaption className='relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6'>
                          <div>
                            <div className='font-display text-base text-slate-900'>
                              {testimonial.author.name}
                            </div>
                            <div className='mt-1 text-sm text-slate-500'>
                              {testimonial.author.role}
                            </div>
                          </div>
                          <div className='overflow-hidden rounded-full bg-slate-50'>
                            <Image
                              className='h-14 w-14 object-cover'
                              src={testimonial.author.image}
                              alt='picture of the testimonial author'
                              width={56}
                              height={56}
                            />
                          </div>
                        </figcaption>
                      </figure>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
