import React, { useState, useEffect } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useFormHandler from '@hooks/use_form_handler';
import * as Api from '../../shared/api';
import { unnullifyFields } from '../../shared/helpers';
import Preloader from '../../shared/preloader';
import translateErrors from '../../shared/translate_errors';
import TagFields from './tag_fields';

function EditTag(props) {
  const tagId = parseInt(props.match.params.id, 10);

  const [tag, setTag, onChange] = useFormHandler({ project_name: '', name: '' });
  const [errors, setErrors] = useState({});
  const [redirectToReferer, setRedirectToReferer] = useState();

  function getTag() {
    if (!tagId) return;

    Api.makeGetRequest({ url: `/api/tags/${tagId}` })
      .then((response) => {
        const updatedTag = unnullifyFields(response.data);
        setTag(updatedTag);
      });
  }

  function saveTag() {
    if (tagId) {
      Api.makePutRequest({ url: `/api/tags/${tag.id}`, body: { id: tag.id, tag } })
        .then(() => {
          setRedirectToReferer('/tags');
        }).catch((results) => {
          setErrors(translateErrors('tag', results.errors));
        });
    } else {
      Api.makePostRequest({ url: '/api/tags', body: { tag } })
        .then(() => setRedirectToReferer('/tags'))
        .catch((results) => setErrors(translateErrors('tag', results.errors)));
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    saveTag();
  }

  function renderFields() {
    if (tagId === tag.id || !tagId) {
      return (
        <TagFields tag={tag} errors={errors} onChange={onChange} setTag={setTag} />
      );
    }

    return <Preloader rowsNumber={2} />;
  }

  useEffect(() => {
    getTag();
  }, []);

  if (redirectToReferer) return <Redirect to={redirectToReferer} />;

  return (
    <form>
      <Helmet>
        {tag.id ? (
          <title>{`${I18n.t('common.edit')} ${tag.name}`}</title>
        ) : (
          <title>{I18n.t('apps.tags.new')}</title>
        )}
      </Helmet>
      {renderFields()}
      <div className="btn-group">
        <NavLink activeClassName="" className="btn btn-secondary" to="/tags">{I18n.t('common.cancel')}</NavLink>
        <input className="btn btn-primary" type="submit" value={I18n.t('common.save')} onClick={onSubmit} />
      </div>
    </form>
  );
}

export default EditTag;
