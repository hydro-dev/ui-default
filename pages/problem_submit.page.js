import { NamedPage } from 'vj/misc/Page';

const page = new NamedPage('problem_submit', async () => {
  $(document).on('click', '[name="problem-sidebar__show-category"]', (ev) => {
    $(ev.currentTarget).hide();
    $('[name="problem-sidebar__categories"]').show();
  });
});

export default page;
