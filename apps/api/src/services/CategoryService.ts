import { Category } from '../models/Category.js';

export const CategoryService = {
  async list() {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    return categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      order: c.order,
    }));
  },

  async findById(id: string) {
    return Category.findById(id);
  },
};
