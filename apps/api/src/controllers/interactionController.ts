export const listNotifications: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const notifications = await NotificationService.list(user._id.toString());
    const unread = await NotificationService.unreadCount(user._id.toString());
    return ok(res, { notifications, unread });
  } catch (err) { next(err); }
};

export const markNotificationRead: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await NotificationService.markRead(user._id.toString(), param(req.params.id));
    return ok(res, result);
  } catch (err) { next(err); }
};

export const markAllNotificationsRead: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) throw new AuthRequiredError();
    const result = await NotificationService.markAllRead(user._id.toString());
    return ok(res, result);
  } catch (err) { next(err); }
};
