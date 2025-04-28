import { Blog, Category, Status } from '../../core/models/blog';

export const blogs: Blog[] = [
  {
    id: 1,
    title: 'Blog 1',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
    image: 'https://picsum.photos/id/10/200/300',
    publishedDate: '2023-01-01',
    modifiedDate: '2023-01-01',
    state: Status.Draft,
    author: {
      firstName: 'John Doe',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@example.com'
    },
    category: {
      id: 1,
      name: 'Mental Health'
    }
  },
  {
    id: 2,
    title: 'Blog 2',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
    image: 'https://picsum.photos/id/10/200/300',
    publishedDate: '2023-01-01',
    modifiedDate: '2023-01-01',
    state: Status.Published,
    author: {
      firstName: 'John Doe',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@example.com'
    },
    category: {
      id: 2,
      name: 'Nutrition'
    }
  },
  {
    id: 3,
    title: 'Blog 3',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
    image: 'https://picsum.photos/id/10/200/300',
    publishedDate: '2023-01-01',
    modifiedDate: '2023-01-01',
    state: Status.Draft,
    author: {
      firstName: 'John Doe',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@example.com'
    },
    category: {
      id: 1,
      name: 'Mental Health'
    }
  },
  {
    id: 4,
    title: 'Blog 4',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
    image: 'https://picsum.photos/id/10/200/300',
    publishedDate: '2023-01-01',
    modifiedDate: '2023-01-01',
    state: Status.Draft,
    author: {
      firstName: 'John Doe',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@example.com'
    },
    category: {
      id: 3,
      name: 'Fitness'
    }
  },
  {
    id: 5,
    title: 'Blog 5',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
    image: 'https://picsum.photos/id/10/200/300',
    publishedDate: '2023-01-01',
    modifiedDate: '2023-01-01',
    state: Status.Published,
    author: {
      firstName: 'John Doe',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@example.com'
    },
    category: {
      id: 3,
      name: 'Fitness'
    }
  }
]

export const categories: Category[] = [
  {
    id: 1,
    name: 'Mental Health'
  },
  {
    id: 2,
    name: 'Nutrition'
  },
  {
    id: 3,
    name: 'Fitness'
  }
]
