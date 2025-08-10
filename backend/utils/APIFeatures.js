class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        let filterQuery = {};
        const queryObj = { ...this.queryString };
        
        console.log('Filter method - queryObj:', queryObj); // Debug log

        // Price filter
        if (queryObj.minPrice && queryObj.maxPrice) {
            if (queryObj.maxPrice.includes('>')) {
                filterQuery.price = { $gte: queryObj.minPrice };
            } else {
                filterQuery.price = {
                    $gte: queryObj.minPrice,
                    $lte: queryObj.maxPrice,
                };
            }
        }

        // Property Type filter
        if (queryObj.propertyType) {
            const types = queryObj.propertyType.split(',').map(t => t.trim());
            // Use case-insensitive regex matching instead of exact matching
            filterQuery.propertyType = { $in: types.map(type => new RegExp(`^${type}$`, 'i')) };
        }

        // Room type
        if (queryObj.roomType) {
            // Use case-insensitive regex matching for room type as well
            filterQuery.roomType = new RegExp(`^${queryObj.roomType}$`, 'i');
        }

        // Amenities filter
        if (queryObj.amenities) {
            filterQuery['amenities.name'] = { $all: queryObj.amenities };
        }
        
        console.log('Filter method - filterQuery built:', filterQuery); // Debug log

        this.query = this.query.find(filterQuery);
        return this;
    }

    search() {
        const queryObj = { ...this.queryString };
        let searchQuery = {};

        // City, state, area search (case-insensitive, space ignored)
        if (queryObj.city) {
            const term = queryObj.city.toLowerCase().replaceAll(' ', '');
            searchQuery = {
                $or: [
                    { 'address.city': term },
                    { 'address.state': term },
                    { 'address.area': term },
                ],
            };
        }

        // Max guests filter
        if (queryObj.guests) {
            searchQuery.maximumGuest = { $gte: queryObj.guests };
        }

        // Date availability
        if (queryObj.dateOut && queryObj.dateIn) {
            searchQuery.$and = [
                {
                    currentBookings: {
                        $not: {
                            $elemMatch: {
                                $or: [
                                    {
                                        fromDate: { $lt: queryObj.dateOut },
                                        toDate: { $gt: queryObj.dateIn },
                                    },
                                    {
                                        fromDate: { $lt: queryObj.dateIn },
                                        toDate: { $gt: queryObj.dateIn },
                                    },
                                ],
                            },
                        },
                    },
                },
            ];
        }

        this.query = this.query.find(searchQuery);
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 12;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
