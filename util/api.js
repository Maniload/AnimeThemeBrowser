exports.toJSON = {
    virtuals: true,
    transform: (doc, ret) => {
        // Delete the _id field, as we have an copy without underscore anyway
        delete ret._id;
    },
    // Delete the __v field aswell, because API users don't need to see it
    versionKey: false
};