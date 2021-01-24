import { NamedPage } from 'vj/misc/PageLoader';
import request from 'vj/utils/request';
import tpl from 'vj/utils/tpl';
import i18n from 'vj/utils/i18n';
import { ConfirmDialog } from 'vj/components/dialog';

const page = new NamedPage('problem_edit', async () => {
  $(document).on('click', '[name="problem-sidebar__show-category"]', (ev) => {
    $(ev.currentTarget).hide();
    $('[name="problem-sidebar__categories"]').show();
  });

  let confirmed = false;

  $(document).on('click', '[name="operation"]', (ev) => {
    ev.preventDefault();
    if (confirmed) {
      return request.post('.', { operation: 'delete' }).then((res) => {
        window.location.href = res.url;
      });
    }
    const message = 'Confirm deleting this problem? Its files, submissions, discussions and solutions will be deleted as well.';
    return new ConfirmDialog({
      $body: tpl`
        <div class="typo">
          <p>${i18n(message)}</p>
        </div>`,
    }).open().then((action) => {
      if (action !== 'yes') return;
      confirmed = true;
      ev.target.click();
    });
  });
});

export default page;
