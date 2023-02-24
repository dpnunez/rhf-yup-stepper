import * as React from 'react'
import * as yup from 'yup'

import {
  Stepper as MStepper,
  Step as MStep,
  StepLabel as MStepLabel,
  Button,
  Stack,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material'

import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

function App() {
  const [step, setStep] = React.useState(0)

  return (
    <Stack
      width="60%"
      m="auto"
      height="calc(100vh - 40px)"
      py="20px"
      spacing={3}
    >
      <Stepper value={step} />

      <Form step={step} handleStep={setStep} />
    </Stack>
  )
}

interface StepperProps {
  value: number
}

interface ControllersProps {
  onChange: React.Dispatch<React.SetStateAction<number>>
  value: number
}

interface FormProps {
  step: number
  handleStep: React.Dispatch<React.SetStateAction<number>>
}

const steps = [
  { id: 0, title: 'Step 1' },
  { id: 1, title: 'Step 2' },
  { id: 2, title: 'Step 3' },
]

const Stepper = ({ value }: StepperProps) => {
  return (
    <MStepper activeStep={value}>
      {steps.map((step) => (
        <MStep disabled key={step.id}>
          <MStepLabel>{step.title}</MStepLabel>
        </MStep>
      ))}
    </MStepper>
  )
}

const StepperControllers = ({ onChange, value }: ControllersProps) => {
  const { trigger } = useFormContext()

  const isLastStep = value === steps.length - 1
  const canNext = value < steps.length - 1
  const canBack = value > 0

  const handleNext = React.useCallback(async () => {
    if (!canNext) return
    const isStepValid = await trigger(undefined, { shouldFocus: true })
    isStepValid && onChange((e) => e + 1)
  }, [onChange, canNext, trigger])

  const handleBack = React.useCallback(() => {
    if (!canBack) return

    onChange((e) => e - 1)
  }, [canBack, onChange])

  return (
    <Stack direction="row" spacing={2}>
      <Button disabled={!canBack} onClick={handleBack} variant="outlined">
        Anterior
      </Button>
      <Button
        type={isLastStep ? 'submit' : 'button'}
        onClick={handleNext}
        variant="outlined"
      >
        {isLastStep ? 'Finalizar' : 'Próximo'}
      </Button>
    </Stack>
  )
}

const Form = ({ step, handleStep }: FormProps) => {
  const methods = useForm({
    // shouldUnregister: false,
    resolver: yupResolver(schema[step]),
    reValidateMode: 'onBlur',
  })

  const stepContent = React.useMemo(() => {
    switch (step) {
      case 0:
        return <Step1 />
      case 1:
        return <Step2 />
      default:
        return null
    }
  }, [step])

  const logValues = () => console.log(methods.formState)

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
        <Box
          flex={1}
          overflow="auto"
          width="400px"
          alignItems="center"
          justifyContent="center"
        >
          <Stack py="20px" spacing={3}>
            {stepContent}
            <Button onClick={logValues}>teste</Button>
          </Stack>
        </Box>
        <StepperControllers value={step} onChange={handleStep} />
      </form>
    </FormProvider>
  )
}

const Step1 = () => {
  const { register, formState } = useFormContext()

  return (
    <React.Fragment>
      <TextField
        error={!!formState.errors.name}
        label="Nome"
        inputProps={{
          ...register('name'),
        }}
      />

      <TextField
        error={!!formState.errors.lastName}
        label="Sobrenome"
        inputProps={{
          ...register('lastName'),
        }}
      />
      <AddressSection />
    </React.Fragment>
  )
}

const AddressSection = () => {
  const { register, control, unregister, formState } = useFormContext()
  const address = useWatch({ name: 'address' })

  React.useEffect(() => {
    if (!address) {
      unregister(['street'])
    }
  }, [address, unregister])

  return (
    <React.Fragment>
      <Controller
        defaultValue={false}
        name="address"
        control={control}
        render={({ field: { value, ...field } }) => (
          <FormControlLabel
            label="Endereço"
            control={<Checkbox checked={value} {...field} />}
          />
        )}
      />
      {address && (
        <>
          <TextField
            error={!!formState.errors.street}
            label="Rua"
            inputProps={{
              ...register('street'),
            }}
          />
        </>
      )}
    </React.Fragment>
  )
}

const Step2 = () => {
  const { register, formState } = useFormContext()

  return (
    <React.Fragment>
      <TextField
        error={!!formState.errors.cardNumber}
        label="Cartão"
        inputProps={{
          ...register('cardNumber'),
        }}
      />
      <TextField
        error={!!formState.errors.cvv}
        label="CVV"
        inputProps={{
          ...register('cvv'),
        }}
      />
    </React.Fragment>
  )
}

const schema = [
  yup
    .object()
    .shape({
      name: yup.string().required(),
      lastName: yup.string().required(),
      address: yup.boolean().required(),
      street: yup.string().when('address', {
        is: true,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
    })
    .required(),
  yup
    .object()
    .shape({
      cardNumber: yup.string().required(),
      cvv: yup.string().required(),
    })
    .required(),
  yup.object().shape({}),
]

export default App
