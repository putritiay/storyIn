import HomePage from "../pages/home/home-page";
import RegisterPage from "../pages/auth/register/register-page";
import LoginPage from "../pages/auth/login/login-page";
import NewPage from "../pages/new/new-page";
import DetailPage from "../pages/detail/detail-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new NewPage()),
  "/detail/:id": () => checkAuthenticatedRoute(new DetailPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
};

export default routes;
