import React, {useEffect, useState} from 'react';
import {useSelector, shallowEqual} from 'react-redux';
import {Currency, FormInitialCurrencyState, GlobalState} from '../../types/types';
import {useDispatch} from 'react-redux';
import {updateRatesForCurrency} from '../../actions/updateRates';
import {CURRENCIES, UPDATE_RATES_DELAY} from '../../constants/currency';
import {ExchangeWidgetView} from './exchange-widget-view';
import {exchangeCurrency} from '../../actions/exchangeCurrency';
import {addNotification} from '../../actions/notification';
import {checkBalance} from '../../utils/validators';
import {useFormCurrencyState} from '../../hooks/useFormCurrencyState';
import {getCurrencyNextIndex} from '../../utils/getCurrencyNextIndex';

interface Props {}

const initialFormValues: FormInitialCurrencyState = {
  currencyFrom: null,
  currencyTo: null,
};

export const ExchangeWidgetContainer: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const [currencyFrom, setCurrencyFrom] = useState<Currency>(CURRENCIES[0]);
  const [currencyTo, setCurrencyTo] = useState<Currency>(CURRENCIES[2]);
  useEffect(() => {
    if (currencyTo === currencyFrom) {
      return;
    }
    dispatch(updateRatesForCurrency(currencyTo));
    function run() {
      dispatch(updateRatesForCurrency(currencyTo));
      setTimeout(run, UPDATE_RATES_DELAY);
    }
    const timerId = setTimeout(() => {
      run();
    }, UPDATE_RATES_DELAY);

    return () => clearTimeout(timerId);
  }, [currencyTo, currencyFrom, dispatch]);

  const rates = useSelector((state: GlobalState) => state.rates, shallowEqual);
  const userBalance = useSelector((state: GlobalState) => state.userBalance, shallowEqual);
  const currencyToRates = rates[currencyTo];
  const currencyFromRate = currencyToRates && currencyToRates.loaded && currencyToRates.rates[currencyFrom];
  const validateOnSubmit = () => {
    return checkBalance({currencyFrom, valueFrom: form.currencyFrom, userBalance});
  };

  const handleExchangeCallBack = (e: React.SyntheticEvent<HTMLElement> | null) => {
    dispatch(exchangeCurrency({currencyFrom, currencyTo, form}));
  };

  const {form, success, submitting, errorMessage, handleChange, handleExchange} = useFormCurrencyState(
    handleExchangeCallBack,
    validateOnSubmit,
    initialFormValues,
    currencyFromRate,
  );

  useEffect(() => {
    if (submitting) return;
    if (success) {
      dispatch(addNotification([{text: 'Exchange success!', variant: 'success'}]));
    } else if (errorMessage) {
      dispatch(addNotification([{text: errorMessage, variant: 'error'}]));
    }
  }, [success, submitting, dispatch, errorMessage]);

  const setCurrencyNextIndex = (currentCurrency: Currency, prevCurrency: Currency) => {
    const currentIndex = CURRENCIES.indexOf(currentCurrency);
    const prevIndex = CURRENCIES.indexOf(prevCurrency);
    return getCurrencyNextIndex({currentIndex, prevIndex});
  };

  const handleCurrencyFromChange = (currency: Currency): void => {
    setCurrencyFrom(currency);
    if (currency === currencyTo) {
      const index = setCurrencyNextIndex(currencyTo, currency);
      setCurrencyTo(CURRENCIES[index]);
    }
  };

  const handleCurrencyToChange = (currency: Currency): void => {
    setCurrencyTo(currency);
    if (currency === currencyFrom) {
      const index = setCurrencyNextIndex(currencyFrom, currency);
      setCurrencyFrom(CURRENCIES[index]);
    }
  };

  return (
    <ExchangeWidgetView
      currencyTo={currencyTo}
      currencyFrom={currencyFrom}
      valueFrom={form.currencyFrom}
      valueTo={form.currencyTo}
      balanceFrom={userBalance[currencyFrom]}
      balanceTo={userBalance[currencyTo]}
      handleCurrencyValueChange={handleChange}
      handleCurrencyToChange={handleCurrencyToChange}
      handleCurrencyFromChange={handleCurrencyFromChange}
      isRateLoading={Boolean(currencyToRates) && currencyToRates.loading}
      rate={currencyFromRate}
      handleExchange={handleExchange}
      isExchangeButtonDisabled={!form.currencyFrom || !form.currencyTo}
    />
  );
};
