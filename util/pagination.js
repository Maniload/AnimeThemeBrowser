const numberFormat = new Intl.NumberFormat();

module.exports = function (limit, offset, total) {
    let totalPages = Math.ceil(total / 30), page = Math.floor(offset / limit);

    let pagination = {
        limit: limit,
        offset: offset,
        total: total,
        totalString: numberFormat.format(total),
        totalPages: totalPages,
        page: page,
        pageString: "Page " + (page + 1) + " of " + totalPages
    };

    if (page > 0) {
        pagination.previousPage = page - 1;
        pagination.previousOffset = offset - limit;
    }

    if (total > limit) {
        pagination.nextPage = page + 1;
        pagination.nextOffset = offset + limit;
    }

    return pagination;
};