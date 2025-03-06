
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getChakraName, getChakraColor, getChakraShortName } from './types';
import { PreferencesFormType } from './types';

const ContentPreferencesForm: React.FC = () => {
  const form = useFormContext<PreferencesFormType>();
  
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="contentCategories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content Categories</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {['meditation', 'chakras', 'yoga', 'reflection', 'dreams', 'astral', 'energy'].map((category) => (
                <FormItem key={category} className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...field.value, category]);
                        } else {
                          field.onChange(field.value.filter(v => v !== category));
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">{category.charAt(0).toUpperCase() + category.slice(1)}</FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="practiceTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Practice Types</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {['guided-meditation', 'silent-meditation', 'breathing', 'movement', 'journaling', 'visualization'].map((type) => (
                <FormItem key={type} className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...field.value, type]);
                        } else {
                          field.onChange(field.value.filter(v => v !== type));
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="chakraFocus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chakra Focus</FormLabel>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {field.value.map((chakraIndex) => (
                  <Badge key={chakraIndex} variant="outline" className="px-2 py-1">
                    {getChakraName(chakraIndex)}
                    <button
                      type="button"
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        field.onChange(field.value.filter(v => v !== chakraIndex));
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((chakraIndex) => (
                  <Button
                    key={chakraIndex}
                    type="button"
                    size="sm"
                    variant={field.value.includes(chakraIndex) ? "default" : "outline"}
                    className={`p-1 ${getChakraColor(chakraIndex)}`}
                    onClick={() => {
                      if (field.value.includes(chakraIndex)) {
                        field.onChange(field.value.filter(v => v !== chakraIndex));
                      } else {
                        field.onChange([...field.value, chakraIndex]);
                      }
                    }}
                  >
                    {getChakraShortName(chakraIndex)}
                  </Button>
                ))}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="contentLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content Level</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select content level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContentPreferencesForm;
