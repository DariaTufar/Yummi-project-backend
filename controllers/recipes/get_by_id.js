const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { HttpError, ctrlWrapper } = require('../../helpers');
const Recipe = require('../../models/recipe');

const getRecipeById = async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  const recipe = await Recipe.aggregate([
    {
      $match: {
        _id: ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'ingredients',
        localField: 'ingredients.id',
        foreignField: '_id',
        as: 'ingr_nfo',
      },
    },
    {
      $set: {
        ingredients: {
          $map: {
            input: '$ingredients',
            in: {
              $mergeObjects: [
                '$$this',
                {
                  $arrayElemAt: [
                    '$ingr_nfo',
                    {
                      $indexOfArray: ['$ingr_nfo._id', '$$this.id'],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $unset: ['ingr_nfo', 'ingredients.id'],
    },
  ]);

  if (!recipe) {
    throw HttpError(404, 'Not found');
  }
  res.status(200).json({
    status: 'success',
    code: 200,
    data: recipe,
  });
};

module.exports = ctrlWrapper(getRecipeById);