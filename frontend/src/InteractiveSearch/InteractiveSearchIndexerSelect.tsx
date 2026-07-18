import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import EnhancedSelectInput, {
  EnhancedSelectInputValue,
} from 'Components/Form/Select/EnhancedSelectInput';
import EnhancedSelectInputSelectedValue from 'Components/Form/Select/EnhancedSelectInputSelectedValue';
import { fetchIndexers } from 'Store/Actions/settingsActions';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';

const ALL_INDEXERS = 0;

interface SelectedValueProps {
  selectedValue: number[];
  values: EnhancedSelectInputValue<number[]>[];
  isDisabled?: boolean;
}

function IndexerSelectedValue({
  selectedValue,
  values,
  isDisabled,
}: SelectedValueProps) {
  const label = useMemo(() => {
    if (selectedValue.includes(ALL_INDEXERS)) {
      return `${translate('All')} ${translate('Indexers')}`;
    }

    if (selectedValue.length === 1) {
      return (
        values.find((value) => value.key === selectedValue[0])?.value ??
        translate('Indexer')
      );
    }

    return `${selectedValue.length} ${translate('Indexers')}`;
  }, [selectedValue, values]);

  return (
    <EnhancedSelectInputSelectedValue isDisabled={isDisabled}>
      {label}
    </EnhancedSelectInputSelectedValue>
  );
}

interface InteractiveSearchIndexerSelectProps {
  className?: string;
  value: number[];
  onChange: (change: EnhancedSelectInputChanged<number[]>) => void;
}

function InteractiveSearchIndexerSelect({
  className,
  value,
  onChange,
}: InteractiveSearchIndexerSelectProps) {
  const dispatch = useDispatch();
  const { isFetching, isPopulated, items } = useSelector(
    (state: AppState) => state.settings.indexers
  );

  const values = useMemo<EnhancedSelectInputValue<number[]>[]>(() => {
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

  const handleChange = useCallback(
    (change: EnhancedSelectInputChanged<number[]>) => {
      let selectedIndexerIds = change.value;

      if (!selectedIndexerIds.length) {
        selectedIndexerIds = [ALL_INDEXERS];
      } else if (selectedIndexerIds.includes(ALL_INDEXERS)) {
        selectedIndexerIds = value.includes(ALL_INDEXERS)
          ? selectedIndexerIds.filter((id) => id !== ALL_INDEXERS)
          : [ALL_INDEXERS];
      }

      onChange({
        ...change,
        value: selectedIndexerIds,
      });
    },
    [onChange, value]
  );

  return (
    <EnhancedSelectInput
      className={className}
      name="indexerIds"
      value={value}
      values={values}
      isFetching={isFetching}
      selectedValueComponent={IndexerSelectedValue}
      onChange={handleChange}
    />
  );
}

export default InteractiveSearchIndexerSelect;
