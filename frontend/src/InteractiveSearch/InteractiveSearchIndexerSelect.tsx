import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Menu from 'Components/Menu/Menu';
import MenuContent from 'Components/Menu/MenuContent';
import PageMenuButton from 'Components/Menu/PageMenuButton';
import SelectedMenuItem from 'Components/Menu/SelectedMenuItem';
import { align, icons } from 'Helpers/Props';
import { fetchIndexers } from 'Store/Actions/settingsActions';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';

const ALL_INDEXERS = 0;

interface InteractiveSearchIndexerSelectProps {
  value: number[];
  onChange: (change: EnhancedSelectInputChanged<number[]>) => void;
}

function InteractiveSearchIndexerSelect({
  value,
  onChange,
}: InteractiveSearchIndexerSelectProps) {
  const dispatch = useDispatch();
  const { isFetching, isPopulated, items } = useSelector(
    (state: AppState) => state.settings.indexers
  );

  const values = useMemo(() => {
    const indexers = items
      .filter((indexer) => indexer.enableInteractiveSearch)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((indexer) => ({
        key: indexer.id,
        value: indexer.name,
      }));

    return [
      {
        key: ALL_INDEXERS,
        value: `${translate('All')} ${translate('Indexers')}`,
      },
      ...indexers,
    ];
  }, [items]);

  useEffect(() => {
    if (!isPopulated && !isFetching) {
      dispatch(fetchIndexers());
    }
  }, [dispatch, isFetching, isPopulated]);

  useEffect(() => {
    if (!isPopulated || value.includes(ALL_INDEXERS)) {
      return;
    }

    const availableIds = new Set(values.map((item) => item.key));
    const availableSelection = value.filter((id) => availableIds.has(id));

    if (
      availableSelection.length !== value.length ||
      !availableSelection.length
    ) {
      onChange({
        name: 'indexerIds',
        value: availableSelection.length ? availableSelection : [ALL_INDEXERS],
      });
    }
  }, [isPopulated, onChange, value, values]);

  const label = useMemo(() => {
    if (value.includes(ALL_INDEXERS)) {
      return `${translate('All')} ${translate('Indexers')}`;
    }

    if (value.length === 1) {
      return (
        values.find((item) => item.key === value[0])?.value ??
        translate('Indexer')
      );
    }

    return `${value.length} ${translate('Indexers')}`;
  }, [value, values]);

  const handleIndexerPress = useCallback(
    (indexerId: string) => {
      const selectedIndexerId = Number(indexerId);
      let selectedIndexerIds = [ALL_INDEXERS];

      if (selectedIndexerId !== ALL_INDEXERS) {
        if (value.includes(selectedIndexerId)) {
          selectedIndexerIds = value.filter((id) => id !== selectedIndexerId);

          if (!selectedIndexerIds.length) {
            selectedIndexerIds = [ALL_INDEXERS];
          }
        } else {
          selectedIndexerIds = [
            ...value.filter((id) => id !== ALL_INDEXERS),
            selectedIndexerId,
          ];
        }
      }

      onChange({
        name: 'indexerIds',
        value: selectedIndexerIds,
      });
    },
    [onChange, value]
  );

  return (
    <Menu alignMenu={align.RIGHT}>
      <PageMenuButton
        iconName={icons.SEARCH}
        showIndicator={!value.includes(ALL_INDEXERS)}
        text={label}
      />

      <MenuContent>
        {values.map((indexer) => {
          return (
            <SelectedMenuItem
              key={indexer.key}
              name={String(indexer.key)}
              isSelected={value.includes(indexer.key)}
              onPress={handleIndexerPress}
            >
              {indexer.value}
            </SelectedMenuItem>
          );
        })}
      </MenuContent>
    </Menu>
  );
}

export default InteractiveSearchIndexerSelect;
