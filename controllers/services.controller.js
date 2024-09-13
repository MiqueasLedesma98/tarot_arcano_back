const { Service, User } = require("../models");

module.exports = {
  create: async (req, res, next) => {
    try {
      const { name, description, price, tags } = req.body;

      const service = new Service({ name, description, price, tags });

      await service.save();

      return res.send({ msg: "Servicio creado", service });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      return res.send({ msg: "Servicio actualizado", service });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const service = await Service.findByIdAndUpdate(
        req.params.id,
        { state: false },
        { new: true }
      );

      return res.send({ msg: "Servicio eliminado", service });
    } catch (error) {
      next(error);
    }
  },
  list_all: async (req, res, next) => {
    try {
      const { search = "", page = 1, limit = 10, tags = [] } = req.query;

      const query = { state: true };

      if (search) {
        const ids = await User.distinct("_id", {
          userName: { $regex: new RegExp(search, "i") },
        });

        query.user = { $in: ids };
      }
      if (tags.length > 0) query.tags = { $in: tags };

      const services = await Service.find(query)
        .select("-state")
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate([
          { path: "user", select: "-state -email -role -google -password" },
          { path: "tags", select: "-state" },
        ])
        .lean({ virtuals: true });

      return res.send(services);
    } catch (error) {
      next(error);
    }
  },
  list_user: async (req, res, next) => {
    try {
      const { search } = req.query;

      const query = { state: true, user: req.uid };

      if (search) query.name = { $regex: new RegExp(search, "i") };

      const services = await Service.find(query)
        .select("-state")
        .lean({ virtuals: true });

      return res.send(services);
    } catch (error) {
      next(error);
    }
  },
};
