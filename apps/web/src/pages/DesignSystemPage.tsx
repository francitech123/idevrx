import { useState } from 'react';
import {
  Button, Input, Textarea, Select, Checkbox, Radio, Switch,
  FormField, Badge, Tag, Avatar, Skeleton,
  Card, CardHeader, CardBody, CardFooter,
  EmptyState, ErrorState,
} from '@/components/ui';
import { PageHeader, Section, ContentGrid, ReadingColumn } from '@/components/layout';
import { Package, Plus, Search } from 'lucide-react';

export function DesignSystemPage() {
  const [textValue, setTextValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('a');
  const [switchOn, setSwitchOn] = useState(false);

  return (
    <ReadingColumn className="max-w-container">
      <PageHeader
        eyebrow="DEV ONLY"
        title="Design System"
        description="Every component in the File 03 §10 library. Not linked from nav. Open in Light and Dark to verify both themes."
      />

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Form fields">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
          <FormField label="Input" htmlFor="ds-input" hint="Helper text goes here" required>
            <Input id="ds-input" placeholder="Type something..." />
          </FormField>
          <FormField label="Input (error)" htmlFor="ds-input-err" error="This field is required">
            <Input id="ds-input-err" invalid placeholder="Type something..." />
          </FormField>
          <FormField label="Textarea" htmlFor="ds-textarea">
            <Textarea id="ds-textarea" value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Long form text..." />
          </FormField>
          <FormField label="Select" htmlFor="ds-select">
            <Select id="ds-select" value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
              <option value="">Choose...</option>
              <option value="a">Option A</option>
              <option value="b">Option B</option>
              <option value="c">Option C</option>
            </Select>
          </FormField>
        </div>
        <div className="mt-6 space-y-3 max-w-2xl">
          <Checkbox label="Checkbox" description="Optional description" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <div className="flex gap-6">
            <Radio name="ds-radio" label="Option A" checked={radioValue === 'a'} onChange={() => setRadioValue('a')} />
            <Radio name="ds-radio" label="Option B" checked={radioValue === 'b'} onChange={() => setRadioValue('b')} />
          </div>
          <Switch label="Switch" description="Toggle something" checked={switchOn} onChange={(e) => setSwitchOn(e.target.checked)} />
        </div>
      </Section>

      <Section title="Badges and tags">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge>Default</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tag>Robotics</Tag>
          <Tag variant="brand">ESP32</Tag>
          <Tag onRemove={() => {}}>Removable</Tag>
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex items-center gap-3">
          <Avatar size="sm" name="Jane Doe" />
          <Avatar size="md" name="John Smith" />
          <Avatar size="lg" name="Alexandra Chen" />
          <Avatar size="xl" name="Robot Builder" />
        </div>
      </Section>

      <Section title="Skeletons">
        <div className="space-y-3 max-w-md">
          <Skeleton variant="text" />
          <Skeleton variant="line" width="60%" />
          <div className="flex gap-3">
            <Skeleton variant="avatar" />
            <Skeleton variant="text" />
          </div>
          <Skeleton variant="card" />
        </div>
      </Section>

      <Section title="Cards">
        <ContentGrid columns={3}>
          <Card>
            <CardHeader><h3 className="font-semibold">Card title</h3></CardHeader>
            <CardBody><p className="text-sm text-text-secondary">Card body content.</p></CardBody>
            <CardFooter><Button size="md" variant="secondary">Action</Button></CardFooter>
          </Card>
          <Card variant="elevated">
            <CardBody><p className="text-sm">Elevated card variant.</p></CardBody>
          </Card>
        </ContentGrid>
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={<Package size={20} />}
          title="No projects yet"
          description="Start your first engineering project and document it here."
          action={<Button><Plus size={14} /> Create project</Button>}
        />
      </Section>

      <Section title="Error state">
        <ErrorState
          title="Could not load projects"
          message="The server is not responding. Please try again."
          details="HTTP 500 — requestId: abcd1234"
          onRetry={() => alert('retry')}
        />
      </Section>

      <Section title="Search input with icon">
        <div className="relative max-w-md">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input placeholder="Search projects..." className="pl-8" />
        </div>
      </Section>
    </ReadingColumn>
  );
}
