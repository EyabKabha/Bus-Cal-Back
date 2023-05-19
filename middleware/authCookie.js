
const admin = (req, res, next) => {
    try {
        const cookie = req.cookies.buscal
        if (cookie) {
            const user = JSON.parse(cookie);
            if (user.role.name === 'admin') {
                req.userId = user.id;
                next();
                return;
            }
        }
        res.status(401).json({ msg: 'Not Authorized' });

    }
    catch (err) {
        throw new Error(`Not authorized: ${err.message}`)
    }
}

const customer = (req, res, next) => {
    try {
        const cookie = req.cookies.buscal
        if (cookie) {
            const user = JSON.parse(cookie);
            if (user.role.name === 'customer') {
                req.userId = user.id;
                next();
                return;
            }
        }
        res.status(401).json({ msg: 'Not Authorized' });

    }
    catch (err) {
        throw new Error(`Not authorized: ${err.message}`)
    }
}

const support = (req, res, next) => {
    try {
        const cookie = req.cookies.buscal
        if (cookie) {
            const user = JSON.parse(cookie);
            if (user.role.name === 'support') {
                req.userId = user.id;
                next();
                return;
            }
        }
        res.status(401).json({ msg: 'Not Authorized' });

    }
    catch (err) {
        throw new Error(`Not authorized: ${err.message}`)
    }
}


const sale = (req, res, next) => {
    try {
        const cookie = req.cookies.buscal
        if (cookie) {
            const user = JSON.parse(cookie);
            if (user.role.name === 'sale') {
                req.userId = user.id;
                next();
                return;
            }
        }
        res.status(401).json({ msg: 'Not Authorized' });

    }
    catch (err) {
        throw new Error(`Not authorized: ${err.message}`)
    }
}

const adminCompany = (req, res, next) => {
    try {
        const cookie = req.cookies.buscal
        if (cookie) {
            const user = JSON.parse(cookie);
            if (user.role.name === 'adminCompany') {
                req.userId = user.id;
                next();
                return;
            }
        }
        res.status(401).json({ msg: 'Not Authorized' });

    }
    catch (err) {
        throw new Error(`Not authorized: ${err.message}`)
    }
}

const userCompany = (req, res, next) => {
    try {
        const cookie = req.cookies.buscal
        if (cookie) {
            const user = JSON.parse(cookie);
            if (user.role.name === 'userCompany') {
                req.userId = user.id;
                next();
                return;
            }
        }
        res.status(401).json({ msg: 'Not Authorized' });

    }
    catch (err) {
        throw new Error(`Not authorized: ${err.message}`)
    }
}

const authRoles = (...roles) => (req, res, next) => {
    try {
        const cookie = req.cookies.buscal
        if (cookie) {
            const user = JSON.parse(cookie);
            for (let i = 0; i < roles.length; i++) {
                if (user.role.id == roles[i]) {
                    req.userId = user.id;
                    next();
                    return;
                }
            }
        }
            res.status(401).json({ msg: 'Not Authorized' });

        }
    catch (err) {
            throw new Error(`Not authorized: ${err.message}`)
        }
    }

module.exports = { admin, customer, support, sale, adminCompany, userCompany, authRoles };
