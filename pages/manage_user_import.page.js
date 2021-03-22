import { NamedPage } from 'vj/misc/Page';
import Notification from 'vj/components/notification';
import i18n from 'vj/utils/i18n';
import request from 'vj/utils/request';
import delay from 'vj/utils/delay';

const page = new NamedPage('manage_user_import', () => {
  async function post(isSubmit) {
    try {
      const res = await request.post('', {
        users: $('[name="users"]').val(),
        confirm: isSubmit ? 'on' : '',
      });
      if (isSubmit) {
        Notification.success(i18n('Created {0} users.', res.users.length));
        await delay(2000);
        window.location.reload();
      } else {
        $('[name="messages"]').text(res.messages.join('\n'));
      }
    } catch (error) {
      Notification.error(error.message);
    }
  }

  $('[name="preview"]').click(() => post(false));
  $('[name="submit"]').click(() => post(true));
});

export default page;
