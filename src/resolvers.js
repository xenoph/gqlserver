export function addCreated({ doc, context }) {
    const now = new Date();

    return {
        ...doc,
        _id: context.uuid(),
        createdAt: now,
        updatedAt: now,
        createdBy: context.user?._id || undefined,
        createdByDisplayName: context.user?.name || undefined,
    };
}

export function addUpdated({ doc, context }) {
    return {
        ...doc,
        updatedAt: new Date(),
        updatedBy: context.user?._id || undefined,
        updatedByDisplayName: context.user?.name || undefined,
    };
}

export function addDeleted({ doc, context }) {
    return {
        ...doc,
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: context.user?._id || undefined,
        deletedByDisplayName: context.user?.name || undefined,
    };
}

export function insertOne(model, options = {}) {
    return async (_, doc, context) => {
        const { transformDoc, onAfter } = options;

        doc = addCreated({ doc, context });

        if (transformDoc)
            doc = await transformDoc({ _, doc, context, model, options });

        const response = await context[model].insertOne(doc);
        const responseData = response.ops[0];

        if (onAfter)
            await onAfter({
                _,
                doc,
                context,
                model,
                options,
                response,
                responseData,
            });

        return responseData;
    };
}

export function updateOne(model, options = {}) {
    return async (_, { _id, ...args }, context) => {
        let query = { _id };
        const { transformDoc, transformQuery, onAfter } = options;

        if (transformDoc)
            args = await transformDoc({
                _,
                doc: args,
                context,
                model,
                options,
                query,
            });

        let doc = addUpdated({ doc: args, context });

        if (transformQuery)
            query = await transformQuery({
                _,
                args,
                context,
                model,
                options,
                doc,
                query,
            });

        const response = await context[model].updateOne(query, { $set: doc });

        if (!response.matchedCount) {
            throw new Error('Document not found');
        }

        const updatedDoc = await context[model].findOne({ _id });

        if (onAfter)
            await onAfter({
                _,
                args,
                context,
                model,
                options,
                doc,
                query,
                updatedDoc,
            });

        return updatedDoc;
    };
}

export function deleteOne(model, options = {}) {
    return async (_, args, context) => {
        let query = args;
        const { transformQuery, onAfter } = options;

        if (transformQuery)
            query = await transformQuery({
                _,
                args,
                context,
                model,
                options,
                query,
            });

        let doc = addDeleted({ doc: args, context });

        const deleteReturn = await context[model].updateOne(query, {
            $set: doc,
        });

        if (!deleteReturn.matchedCount) {
            throw new Error('Document not found');
        }

        if (onAfter)
            await onAfter({ _, args, doc, context, model, options, query });

        return deleteReturn.matchedCount === 1;
    };
}

export function findOne(model, options = {}) {
    let afterFindOne =
        (options && options.afterFindOne) ||
        (async (doc, _, { _id }, context) => {
            return doc;
        });

    return async (_, args, context) => {
        let query = args;

        if (!query.hasOwnProperty('isDeleted')) {
            query.isDeleted = { $ne: true };
        }

        if (options && options.transformQuery) {
            query = await options.transformQuery(_, args, query, context);
        }

        const doc = await context[model].findOne(query);

        if (!doc && query._id !== 'root') {
            throw new Error('Ikke funnet');
        }

        return await afterFindOne(doc, _, args, context);
    };
}

export function find(model, options = {}) {
    return async (
        parentNode,
        { limit, skip, search, order, orderBy, ...args },
        context,
        info
    ) => {
        let query = {};
        let queryArgs = (options && options.queryArgs) || [];
        let selectionSetArray = [];

        info.fieldNodes[0].selectionSet.selections.map((selection) =>
            selectionSetArray.push(selection.name.value)
        );

        if (search) {
            query['$text'] = {
                $search: search,
            };
        }

        queryArgs.forEach((key) => {
            if (typeof args[key] == 'undefined') {
                return;
            }

            query[key] = args[key];
        });

        if (!query.hasOwnProperty('isDeleted')) {
            query.isDeleted = { $ne: true };
        }

        if (options && options.transformQuery) {
            query = await options.transformQuery(
                parentNode,
                args,
                query,
                context
            );
        }

        let cursor = context[model]
            .find(query)
            .collation({ locale: 'nb', caseLevel: false });

        if (orderBy) {
            cursor.sort({ [orderBy]: order || -1 });
        }

        cursor.skip(skip || 0).limit(limit || 0);

        let count = null;
        let items = null;

        if (selectionSetArray.indexOf('count') > -1) {
            count = await context[model].find(query).count();
        }

        if (selectionSetArray.indexOf('items') > -1) {
            items = await cursor.toArray();
        }

        if (options && options.afterPaginate) {
            return options.afterPaginate(
                {
                    count,
                    items,
                },
                parentNode,
                { ...query, ...args },
                context,
                info
            );
        }

        return {
            count,
            items,
        };
    };
}

export function simpleFind(model) {
    return async (_, query, context) => {
        if (!query.hasOwnProperty('isDeleted')) {
            query.isDeleted = { $ne: true };
        }

        return await context[model].find(query).toArray();
    };
}

export function hasOne(model, options = {}) {
    return async (parentNode, {}, context) => {
        const { localKey } = options;

        return await context[model].findOne({ _id: parentNode[localKey] });
    };
}

export function connection(model, options = {}) {
    return async (
        parentNode,
        { limit, skip, search, order, orderBy, ...args },
        context
    ) => {
        let query = {};
        let queryArgs = (options && options.queryArgs) || [];

        query[options.foreignKey] = parentNode[options.localKey || '_id'];

        if (search) {
            query['$search'] = {
                $search: search,
            };
        }

        queryArgs.forEach((key) => {
            query[key] = args[key];
        });

        if (options.transformQuery) {
            query = await options.transformQuery(
                parentNode,
                args,
                query,
                context
            );
        }

        let cursor = context[model].find(query);

        if (orderBy) {
            cursor.sort({ [orderBy]: order || -1 });
        }

        cursor.skip(skip || 0).limit(limit || 25);

        return {
            count: await context[model].find(query).count(),
            items: await cursor.toArray(),
        };
    };
}
