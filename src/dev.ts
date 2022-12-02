import {config} from 'dotenv';
import ArBoxApp from './ArBoxApp';

config();

(async () => {
  const {
    ARBOX_BOX_ID = '',
    ARBOX_BOX_NAME = '',
    ARBOX_LOCATION_ID = '',
    ARBOX_SESSION_JWT = '',
    ARBOX_EMAIL = '',
    ARBOX_PASSWORD = '',
  } = process.env;

  const arbox = new ArBoxApp(
    Number(ARBOX_BOX_ID),
    ARBOX_BOX_NAME,
    Number(ARBOX_LOCATION_ID),
    ARBOX_SESSION_JWT,
    ARBOX_EMAIL,
    ARBOX_PASSWORD,
    true
  );

  const res = await arbox.getStats();
  console.log(res);
})();
